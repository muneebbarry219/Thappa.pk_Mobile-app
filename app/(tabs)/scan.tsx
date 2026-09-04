import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { Text } from "../../src/components/AppText";
import { IconCircle } from "../../src/components/IconCircle";
import { apiClient, apiErrorMessage } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { useRouter } from "expo-router";
import { notifyStampAdded } from "../../src/notifications/registerPushToken";
import { useNotifications } from "../../src/notifications/NotificationContext";
import { useCampaigns } from "../../src/campaigns/CampaignContext";
import { colors, radius } from "../../src/theme";

type ResultMessage = { type: "success" | "error"; text: string };

function parseScannedValue(raw: string): { qrToken?: string; branchId?: string; cafeId?: string; campaignId?: string; userId?: string } {
  const normalized = raw.replaceAll("&amp;", "&");
  if (normalized.startsWith("http://") || normalized.startsWith("https://") || normalized.startsWith("thappa://")) {
    try {
      const url = new URL(normalized.replace("thappa://", "https://placeholder/"));
      return {
        branchId: url.searchParams.get("b") || undefined,
        cafeId: url.searchParams.get("cafeId") || undefined,
        campaignId: url.searchParams.get("campaignId") || undefined,
        userId: url.searchParams.get("userId") || undefined,
      };
    } catch {
      return {};
    }
  }
  return { qrToken: normalized };
}

export default function ScanScreen() {
  const { isPreview, user } = useAuth();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { addPreviewStamp } = useCampaigns();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<ResultMessage | null>(null);
  const [previewOutcomeIndex, setPreviewOutcomeIndex] = useState(0);

  useEffect(() => {
    if (resultMessage?.type !== "success") return;
    const returnTimer = setTimeout(() => router.back(), 3000);
    return () => clearTimeout(returnTimer);
  }, [resultMessage, router]);

  function showStampAdded(campaignName: string, currentStamps: number, stampsRequired: number) {
    const remaining = Math.max(0, stampsRequired - currentStamps);
    const message = `Stamp added against ${campaignName}. ${remaining} more to go!`;
    setResultMessage({ type: "success", text: message });
    addNotification({ headline: "Stamp added!", description: message });
    void notifyStampAdded(campaignName, remaining);
  }

  function handleSimulateScan() {
    const mockScans = [
      { campaignId: "melbrew-iced-latte", cafeId: "melbrew-coffee" },
      { campaignId: "foods-inn-50-off", cafeId: "foods-inn" },
    ];
    const mock = mockScans[previewOutcomeIndex];
    if (!user) return;
    const result = addPreviewStamp({ ...mock, userId: user.id });
    if (!result) return setResultMessage({ type: "error", text: "This campaign is not active for this user." });
    showStampAdded(result.card.businessId.name, result.card.currentStamps, result.card.stampsRequired);
    setPreviewOutcomeIndex((index) => (index + 1) % mockScans.length);
  }

  async function handleBarcodeScanned({ data }: { data: string }) {
    if (scanned || loading) return;
    setScanned(true);

    setLoading(true);
    setResultMessage(null);
    try {
      const { qrToken, branchId, cafeId, campaignId, userId } = parseScannedValue(data);

      if (isPreview) {
        if (!cafeId || !campaignId || !userId || userId !== user?.id) {
          throw new Error("This QR code does not belong to the signed-in preview user.");
        }
        const result = addPreviewStamp({ cafeId, campaignId, userId });
        if (!result) throw new Error("This campaign is not active for this user.");
        showStampAdded(result.card.businessId.name, result.card.currentStamps, result.card.stampsRequired);
        return;
      }

      let body: Record<string, unknown>;

      if (qrToken) {
        body = { qrToken };
      } else if (branchId) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setResultMessage({ type: "error", text: "Location permission is required to collect a stamp here." });
          return;
        }
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        body = { branchId, lat: position.coords.latitude, lng: position.coords.longitude };
      } else {
        throw new Error("Unrecognized QR code");
      }

      const { data: response } = await apiClient.post("/customer/stamps/redeem-qr", body);
      const stampCard = response.stampCard;
      const campaignName = stampCard?.businessId?.name || response.campaign?.name || "your campaign";
      showStampAdded(campaignName, stampCard?.currentStamps ?? 0, stampCard?.stampsRequired ?? 0);
    } catch (error) {
      setResultMessage({ type: "error", text: apiErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  function scanAgain() {
    setScanned(false);
    setResultMessage(null);
  }

  if (!permission) return <View style={styles.center}><ActivityIndicator color={colors.forest} /></View>;

  if (!permission.granted && !resultMessage) {
    return (
      <View style={styles.center}>
        <IconCircle name="scan" size={58} iconSize={27} style={styles.permissionIcon} />
        <Text style={styles.permissionTitle}>Ready when you are.</Text>
        <Text style={styles.permissionText}>Allow camera access to scan a Thappa code and collect your next stamp.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}><Text style={styles.buttonText}>Allow camera access</Text></TouchableOpacity>
        {isPreview && <TouchableOpacity style={styles.previewButton} onPress={handleSimulateScan}><Text style={styles.previewText}>Preview a scan</Text></TouchableOpacity>}
      </View>
    );
  }

  if (resultMessage) {
    return (
      <View style={styles.resultContainer}>
        <IconCircle name={resultMessage.type === "success" ? "checkmark" : "alert"} size={72} iconSize={30} />
        <Text style={resultMessage.type === "success" ? styles.resultSuccess : styles.resultError}>{resultMessage.text}</Text>
        <Text style={styles.resultSub}>{resultMessage.type === "success" ? "Your campaign progress is up to date." : "Give it another go, or ask the team at the counter."}</Text>
        <TouchableOpacity style={styles.button} onPress={scanAgain}><Text style={styles.buttonText}>Scan another code</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={scanned ? undefined : handleBarcodeScanned} />
      <View style={styles.shade}>
        <View style={styles.scanTop}><Text style={styles.scanEyebrow}>THAPPA SCANNER</Text><Text style={styles.scanTitle}>Find the QR code.</Text></View>
        <View style={styles.frame}><View style={[styles.corner, styles.topLeft]} /><View style={[styles.corner, styles.topRight]} /><View style={[styles.corner, styles.bottomLeft]} /><View style={[styles.corner, styles.bottomRight]} /></View>
        <View style={styles.scanBottom}>
          <Text style={styles.hint}>{loading ? "Checking your stamp..." : "Hold steady - we'll do the rest."}</Text>
          {isPreview && <TouchableOpacity style={styles.previewButton} onPress={handleSimulateScan}><Text style={styles.previewText}>Preview a scan</Text></TouchableOpacity>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, backgroundColor: colors.cream },
  permissionIcon: { marginBottom: 18 },
  permissionTitle: { color: colors.ink, fontSize: 23, fontWeight: "900" },
  permissionText: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 8, marginBottom: 22 },
  button: { backgroundColor: colors.forest, borderRadius: radius.pill, paddingVertical: 15, paddingHorizontal: 22, alignItems: "center" },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: "900" },
  shade: { flex: 1, justifyContent: "space-between", padding: 23, backgroundColor: "rgba(26, 43, 32, 0.30)" },
  scanTop: { marginTop: 12 },
  scanEyebrow: { color: colors.yellow, fontWeight: "900", fontSize: 10, letterSpacing: 1.4 },
  scanTitle: { color: colors.white, fontSize: 25, fontWeight: "900", marginTop: 5 },
  frame: { width: 244, height: 244, alignSelf: "center", position: "relative" },
  corner: { position: "absolute", width: 45, height: 45, borderColor: colors.yellow },
  topLeft: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 19 },
  topRight: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 19 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 19 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 19 },
  scanBottom: { alignItems: "center", marginBottom: 13 },
  hint: { color: colors.white, fontSize: 14, fontWeight: "700", marginBottom: 15 },
  previewButton: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.yellowSoft },
  previewText: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  resultContainer: { flex: 1, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center", padding: 30 },
  resultSuccess: { color: colors.ink, fontSize: 23, fontWeight: "900", lineHeight: 30, textAlign: "center", marginTop: 20 },
  resultError: { color: colors.danger, fontSize: 20, fontWeight: "900", lineHeight: 27, textAlign: "center", marginTop: 20 },
  resultSub: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 8, marginBottom: 24 },
});
