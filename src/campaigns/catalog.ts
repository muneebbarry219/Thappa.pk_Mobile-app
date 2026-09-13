import type { Ionicons } from "@expo/vector-icons";

/** A campaign added by a Thappa admin, as returned by GET /customer/campaigns. */
export interface Campaign {
  _id: string;
  headline: string;
  description: string;
  stampsRequired: number;
  rewardDescription: string;
  businessId: { _id: string; name: string; category: string; logoUrl?: string };
  /** ISO timestamp; after this the campaign is removed from the app. */
  expiresAt: string;
  createdAt: string;
}

export function isCampaignLive(campaign: Pick<Campaign, "expiresAt">, now = Date.now()): boolean {
  return new Date(campaign.expiresAt).getTime() > now;
}

/** e.g. "12 Oct 2026" */
export function formatExpiry(expiresAt: string): string {
  return new Date(expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

type IconName = keyof typeof Ionicons.glyphMap;

const CATEGORY_ICONS: Record<string, IconName> = {
  CAFE: "cafe",
  RESTAURANT: "restaurant",
  SALON: "cut",
  GYM: "fitness",
};

export function campaignIcon(category?: string): IconName {
  return CATEGORY_ICONS[(category || "").toUpperCase()] || "storefront";
}

/** "RESTAURANT" -> "Restaurant" */
export function formatCategory(category?: string): string {
  return category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : "";
}
