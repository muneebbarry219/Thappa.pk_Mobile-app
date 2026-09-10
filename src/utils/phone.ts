/**
 * Normalizes a Pakistani phone number into E.164 format (e.g. "+923001234567"),
 * which is what Firebase Phone Auth (and the backend's Firebase-verified user
 * lookup) requires. Accepts local formats like "0300-1234567", "0300 1234567",
 * "923001234567", or an already-E.164 "+923001234567".
 *
 * Returns null if the result doesn't look like a valid E.164 number.
 */
export function toE164Phone(raw: string, defaultCountryCode = "92"): string | null {
  const digitsAndPlus = raw.trim().replace(/[^\d+]/g, "");
  if (!digitsAndPlus) return null;

  let normalized: string;
  if (digitsAndPlus.startsWith("+")) {
    normalized = digitsAndPlus;
  } else if (digitsAndPlus.startsWith("00")) {
    normalized = `+${digitsAndPlus.slice(2)}`;
  } else if (digitsAndPlus.startsWith("0")) {
    // Local format, e.g. 0300xxxxxxx -> +92300xxxxxxx
    normalized = `+${defaultCountryCode}${digitsAndPlus.slice(1)}`;
  } else if (digitsAndPlus.startsWith(defaultCountryCode)) {
    normalized = `+${digitsAndPlus}`;
  } else {
    // Bare subscriber number with no leading 0, e.g. 300xxxxxxx
    normalized = `+${defaultCountryCode}${digitsAndPlus}`;
  }

  // E.164: '+' followed by 8-15 digits total.
  return /^\+\d{8,15}$/.test(normalized) ? normalized : null;
}
