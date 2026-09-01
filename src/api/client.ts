import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:4000/v1";

export const apiClient = axios.create({ baseURL: API_BASE_URL });

const ACCESS_KEY = "thappa_access_token";
const REFRESH_KEY = "thappa_refresh_token";

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(ACCESS_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          await AsyncStorage.setItem(ACCESS_KEY, data.accessToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(original);
        } catch {
          await AsyncStorage.removeItem(ACCESS_KEY);
          await AsyncStorage.removeItem(REFRESH_KEY);
        }
      }
    }
    return Promise.reject(error);
  }
);

export async function saveTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.setItem(ACCESS_KEY, accessToken);
  await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
}

export async function clearTokens() {
  await AsyncStorage.removeItem(ACCESS_KEY);
  await AsyncStorage.removeItem(REFRESH_KEY);
}

export function apiErrorMessage(err: unknown): string {
  const anyErr = err as any;
  return anyErr?.response?.data?.error?.message || anyErr?.message || "Something went wrong";
}
