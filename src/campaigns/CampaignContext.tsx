import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Campaign } from "./catalog";
import { MockStampCard, MOCK_CAMPAIGNS, MOCK_STAMP_CARDS } from "../preview/mockData";

const CAFE_IDS: Record<string, string> = {
  "melbrew-iced-latte": "melbrew-coffee",
  "foods-inn-50-off": "foods-inn",
  "habibi-special-platter": "habibi-shawarma",
};

/** A stamp card as the active-campaign lists render it. */
export interface ActiveCampaignCard {
  _id: string;
  currentStamps: number;
  stampsRequired: number;
  businessId: { _id?: string; name: string; category: string };
  branchId: { name: string; address?: string };
  /** Set when the customer tapped "Join" on a campaign from this business. */
  joined?: boolean;
  /** Set for a joined campaign that has no stamp card yet (no stamps collected). */
  campaignId?: string;
}

interface StampResult {
  card: MockStampCard;
  remaining: number;
  completed: boolean;
}

interface CampaignContextValue {
  /** Preview-mode stamp cards. */
  campaigns: MockStampCard[];
  /** Live, admin-created campaigns. */
  availableCampaigns: Campaign[];
  campaignsLoaded: boolean;
  joinedCampaignIds: string[];
  isJoined: (campaignId: string) => boolean;
  joinCampaign: (campaignId: string) => Promise<void>;
  refreshCampaigns: () => Promise<void>;
  addPreviewStamp: (input: { campaignId: string; cafeId: string; userId: string }) => StampResult | null;
}

const CampaignContext = createContext<CampaignContextValue | undefined>(undefined);

function sameBusiness(a: { _id?: string; name: string }, b: { _id?: string; name: string }) {
  if (a._id && b._id) return a._id === b._id;
  return a.name.toLowerCase() === b.name.toLowerCase();
}

/**
 * Merges joined campaigns into a list of stamp cards: cards for a joined
 * campaign's business are flagged `joined`, and joined campaigns with no card
 * yet are added (newest first) as 0-stamp entries.
 */
export function withJoinedCampaigns(
  cards: ActiveCampaignCard[],
  joinedCampaignIds: string[],
  availableCampaigns: Campaign[],
): ActiveCampaignCard[] {
  const joined = joinedCampaignIds
    .map((id) => availableCampaigns.find((campaign) => campaign._id === id))
    .filter((campaign): campaign is Campaign => !!campaign);

  const markedCards = cards.map((card) =>
    joined.some((campaign) => sameBusiness(campaign.businessId, card.businessId)) ? { ...card, joined: true } : card
  );
  const notStarted = joined
    .filter((campaign) => !cards.some((card) => sameBusiness(campaign.businessId, card.businessId)))
    .reverse()
    .map<ActiveCampaignCard>((campaign) => ({
      _id: `joined-${campaign._id}`,
      currentStamps: 0,
      stampsRequired: campaign.stampsRequired,
      businessId: campaign.businessId,
      branchId: { name: campaign.headline },
      joined: true,
      campaignId: campaign._id,
    }));

  return [...notStarted, ...markedCards];
}

export function CampaignProvider({ children }: { children: ReactNode }) {
  const { user, isPreview } = useAuth();
  const userId = user?.id;
  const [campaigns, setCampaigns] = useState<MockStampCard[]>(MOCK_STAMP_CARDS);
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoaded, setCampaignsLoaded] = useState(false);
  const [joinedCampaignIds, setJoinedCampaignIds] = useState<string[]>([]);

  const refreshCampaigns = useCallback(async () => {
    if (!userId || isPreview) return;
    try {
      const [campaignsRes, joinedRes] = await Promise.all([
        apiClient.get("/customer/campaigns"),
        apiClient.get("/customer/campaigns/joined"),
      ]);
      setAvailableCampaigns(campaignsRes.data.data);
      setJoinedCampaignIds((joinedRes.data.data as { campaignId: string }[]).map((item) => item.campaignId));
    } catch {
      // Keep the last known lists if a refresh fails.
    } finally {
      setCampaignsLoaded(true);
    }
  }, [userId, isPreview]);

  useEffect(() => {
    if (!userId) {
      setAvailableCampaigns([]);
      setJoinedCampaignIds([]);
      setCampaignsLoaded(false);
    } else if (isPreview) {
      setAvailableCampaigns(MOCK_CAMPAIGNS);
      setJoinedCampaignIds([]);
      setCampaignsLoaded(true);
    } else {
      refreshCampaigns();
    }
  }, [userId, isPreview, refreshCampaigns]);

  function isJoined(campaignId: string) {
    return joinedCampaignIds.includes(campaignId);
  }

  async function joinCampaign(campaignId: string) {
    if (isPreview) {
      setJoinedCampaignIds((ids) => (ids.includes(campaignId) ? ids : [...ids, campaignId]));
      return;
    }
    const { data } = await apiClient.post(`/customer/campaigns/${campaignId}/join`);
    setJoinedCampaignIds((data.data as { campaignId: string }[]).map((item) => item.campaignId));
  }

  function addPreviewStamp({ campaignId, cafeId, userId }: { campaignId: string; cafeId: string; userId: string }) {
    if (userId !== "preview-user" || CAFE_IDS[campaignId] !== cafeId) return null;
    const current = campaigns.find((campaign) => campaign._id === campaignId);
    if (!current || current.currentStamps >= current.stampsRequired) return null;

    const card = { ...current, currentStamps: current.currentStamps + 1 };
    setCampaigns((items) => items.map((item) => item._id === campaignId ? card : item));
    return { card, remaining: card.stampsRequired - card.currentStamps, completed: card.currentStamps >= card.stampsRequired };
  }

  return (
    <CampaignContext.Provider
      value={{ campaigns, availableCampaigns, campaignsLoaded, joinedCampaignIds, isJoined, joinCampaign, refreshCampaigns, addPreviewStamp }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const context = useContext(CampaignContext);
  if (!context) throw new Error("useCampaigns must be used within CampaignProvider");
  return context;
}
