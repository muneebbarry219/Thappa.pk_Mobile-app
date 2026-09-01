import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { apiClient, apiErrorMessage } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";

// In preview mode a scan alternates between these two canned outcomes so a
// developer can see both the "stamp added" and "reward unlocked" screens
// without a real QR code or backend.
const MOCK_SCAN_OUTCOMES = [
  { type: "success" as const, text: "Stamp added! 4 / 5" },
  { type: "success" as const, text: "🎉 Reward unlocked! 1 Free Item\nShow code 482913 to staff." },
];

export default function ScanScreen() {
  const { isPreview } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewOutcomeIndex, setPreviewOutcomeIndex] = useState(0);
  const router = useRouter();

  function handleSimulateScan() {
    setResultMessage(MOCK_SCAN_OUTCOMES[previewOutcomeIndex]);
    setPreviewOutcomeIndex((i) => (i + 1) % MOCK_SCAN_OUTCOMES.length);
  }

  // A scanned QR encodes either:
  //  - a raw signed JWT (Mode A — the counter tablet renders the QR image
  //    directly from the qrToken string), or
  //  - a deep link like https://app.thappa.in/scan?b=<branchId>&static=1
  //    (Mode B storefront QR) which we parse for the branchId.
  function parseScannedValue(raw: string): { qrToken?: string; branchId?: string } {
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("thappa://")) {
      try {
        const url = new URL(raw.replace("thappa://", "https://placeholder/"));
        const branchId = url.searchParams.get("b") || undefined;
        return { branchId };
      } catch {
        return {};
      }
    }
    // Otherwise assume it's a raw JWT (Mode A dynamic stamp QR).
    return { qrToken: raw };
  }

  async function handleBarcodeScanned({ data }: { data: string }) {
    if (scanned || loading) return;
    setScanned(true);

    if (isPreview) {
      handleSimulateScan();
      return;
    }

    setLoading(true);
    setResultMessage(null);

    try {
      const { qrToken, branchId } = parseScannedValue(data);

      let body: Record<string, unknown>;
      if (qrToken) {
        body = { qrToken };
      } else if (branchId) {
        // Mode B: static counter QR — confirm the visit with GPS.
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setResultMessage({ type: "error", text: "Location permission is required to collect a stamp here." });
          setLoading(false);
          return;
        }
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        body = { branchId, lat: position.coords.latitude, lng: position.coords.longitude };
      } else {
        throw new Error("Unrecognized QR code");
      }

      const { data: response } = await apiClient.post("/customer/stamps/redeem-qr", body);

      if (response.rewardUnlocked) {
        setResultMessage({
          type: "success",
          text: `🎉 Reward unlocked! ${response.redemption.rewardDescription}\nShow code ${response.redemption.redemptionCode} to staff.`,
        });
      } else {
        setResultMessage({
          type: "success",
          text: `Stamp added! ${response.stampCard.currentStamps} / ${response.stampCard.stampsRequired}`,
        });
      }
    } catch (err) {
      setResultMessage({ type: "error", text: apiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }

  function scanAgain() {
    setScanned(false);
    setResultMessage(null);
  }

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator color="#fca311" /></View>;
  }

  if (!permission.granted && !resultMessage) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>Thappa needs camera access to scan stamp QR codes.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Access</Text>
        </TouchableOpacity>
        {isPreview && (
          <TouchableOpacity style={[styles.button, styles.simulateButton]} onPress={handleSimulateScan}>
            <Text style={styles.buttonText}>🛠 Simulate a scan instead</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!resultMessage ? (
        <>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.hint}>{loading ? "Checking QR…" : "Point your camera at the stamp QR code"}</Text>
            {isPreview && (
              <TouchableOpacity style={[styles.button, styles.simulateButton]} onPress={handleSimulateScan}>
                <Text style={styles.buttonText}>🛠 Simulate a scan</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={resultMessage.type === "success" ? styles.resultSuccess : styles.resultError}>{resultMessage.text}</Text>
          <TouchableOpacity style={styles.button} onPress={scanAgain}>
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "white" },
  permissionText: { textAlign: "center", marginBottom: 16, color: "#374151" },
  overlay: { flex: 1, alignItems: "center", justifyContent: "center" },
  scanFrame: { width: 240, height: 240, borderWidth: 3, borderColor: "#fca311", borderRadius: 16, backgroundColor: "transparent" },
  hint: { color: "white", marginTop: 20, fontSize: 14 },
  resultContainer: { flex: 1, backgroundColor: "white", alignItems: "center", justifyContent: "center", padding: 32 },
  resultSuccess: { fontSize: 18, fontWeight: "700", color: "#14213d", textAlign: "center", marginBottom: 24 },
  resultError: { fontSize: 16, fontWeight: "600", color: "#dc2626", textAlign: "center", marginBottom: 24 },
  button: { backgroundColor: "#14213d", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28 },
  buttonText: { color: "white", fontWeight: "700" },
  simulateButton: { marginTop: 16, backgroundColor: "#fca311" },
});
