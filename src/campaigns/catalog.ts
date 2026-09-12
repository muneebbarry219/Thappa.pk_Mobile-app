import type { Ionicons } from "@expo/vector-icons";

/** A campaign added by a Thappa admin, as returned by GET /customer/campaigns. */
export interface Campaign {
  _id: string;
  headline: string;
  description: string;
  stampsRequired: number;
  rewardDescription: string;
  businessId: { _id: string; name: string; category: string; logoUrl?: string };
  createdAt: string;
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
