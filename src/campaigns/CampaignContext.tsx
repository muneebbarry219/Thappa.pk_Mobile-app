import { createContext, ReactNode, useContext, useState } from "react";
import { MockStampCard, MOCK_STAMP_CARDS } from "../preview/mockData";

const CAFE_IDS: Record<string, string> = {
  "melbrew-iced-latte": "melbrew-coffee",
  "foods-inn-50-off": "foods-inn",
  "habibi-special-platter": "habibi-shawarma",
};

interface StampResult {
  card: MockStampCard;
  remaining: number;
  completed: boolean;
}

interface CampaignContextValue {
  campaigns: MockStampCard[];
  addPreviewStamp: (input: { campaignId: string; cafeId: string; userId: string }) => StampResult | null;
}

const CampaignContext = createContext<CampaignContextValue | undefined>(undefined);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<MockStampCard[]>(MOCK_STAMP_CARDS);

  function addPreviewStamp({ campaignId, cafeId, userId }: { campaignId: string; cafeId: string; userId: string }) {
    if (userId !== "preview-user" || CAFE_IDS[campaignId] !== cafeId) return null;
    const current = campaigns.find((campaign) => campaign._id === campaignId);
    if (!current || current.currentStamps >= current.stampsRequired) return null;

    const card = { ...current, currentStamps: current.currentStamps + 1 };
    setCampaigns((items) => items.map((item) => item._id === campaignId ? card : item));
    return { card, remaining: card.stampsRequired - card.currentStamps, completed: card.currentStamps >= card.stampsRequired };
  }

  return <CampaignContext.Provider value={{ campaigns, addPreviewStamp }}>{children}</CampaignContext.Provider>;
}

export function useCampaigns() {
  const context = useContext(CampaignContext);
  if (!context) throw new Error("useCampaigns must be used within CampaignProvider");
  return context;
}
