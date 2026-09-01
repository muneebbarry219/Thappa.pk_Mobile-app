// Static fixtures for "Preview UI" mode (see AuthContext#previewLogin). Every
// screen that normally hits the API reads from here instead, so a developer
// can review the whole app's UI/design with no backend running at all.

export interface MockTransaction {
  _id: string;
  type: string;
  createdAt: string;
}

export interface MockStampCard {
  _id: string;
  currentStamps: number;
  stampsRequired: number;
  businessId: { name: string; category: string };
  branchId: { name: string; address?: string };
  transactions: MockTransaction[];
}

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_STAMP_CARDS: MockStampCard[] = [
  {
    _id: "preview-card-1",
    currentStamps: 3,
    stampsRequired: 5,
    businessId: { name: "Cafe Mocha", category: "CAFE" },
    branchId: { name: "Clifton Branch", address: "Block 5, Clifton, Karachi" },
    transactions: [
      { _id: "t1", type: "EARN", createdAt: daysAgo(1) },
      { _id: "t2", type: "EARN", createdAt: daysAgo(4) },
      { _id: "t3", type: "EARN", createdAt: daysAgo(9) },
    ],
  },
  {
    _id: "preview-card-2",
    currentStamps: 5,
    stampsRequired: 5,
    businessId: { name: "Bella's Bakery", category: "RESTAURANT" },
    branchId: { name: "Gulberg Branch", address: "Main Boulevard, Gulberg, Lahore" },
    transactions: [
      { _id: "t4", type: "EARN", createdAt: daysAgo(0) },
      { _id: "t5", type: "EARN", createdAt: daysAgo(2) },
      { _id: "t6", type: "EARN", createdAt: daysAgo(5) },
      { _id: "t7", type: "MANUAL_ADJUST_ADD", createdAt: daysAgo(8) },
      { _id: "t8", type: "EARN", createdAt: daysAgo(12) },
    ],
  },
  {
    _id: "preview-card-3",
    currentStamps: 1,
    stampsRequired: 8,
    businessId: { name: "Glow Salon", category: "SALON" },
    branchId: { name: "DHA Branch", address: "Phase 6, DHA, Karachi" },
    transactions: [{ _id: "t9", type: "EARN", createdAt: daysAgo(3) }],
  },
];

export function findMockCard(id: string): MockStampCard | undefined {
  return MOCK_STAMP_CARDS.find((c) => c._id === id);
}
