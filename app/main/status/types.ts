export type TabKey = "daily" | "monthly";

export interface StatusRow {
  date: string;
  location: string;
  amount: string;
  points: string;
}

export interface StatusApiResponse {
  success: boolean;
  data: StatusRow[];
  error?: string;
}
