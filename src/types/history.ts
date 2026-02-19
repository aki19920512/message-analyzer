export interface HistoryEntry {
  id: string;
  partnerId?: string;
  partnerName: string;
  createdAt: string;
  draft: string;
  goal: string;
  scores: {
    warmthMatch: number;
    pressureRisk: number;
    sincerity: number;
    clarity: number;
    styleMatch: number;
  };
  reasons: string[];
  suggestions: Array<{
    label: string;
    text: string;
  }>;
  nextStep: string;
  isFavorite: boolean;
}

export interface HistoryStorage {
  entries: HistoryEntry[];
  version: number;
}
