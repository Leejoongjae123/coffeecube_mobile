export interface PointRecord {
  id?: number;
  user_id?: string;
  points: number;
  transaction_type: "earned" | "used";
  description?: string;
  created_at: string;
  date: string;
  earned: number;
  used: number;
}

export interface PointRow extends PointRecord {
  total?: number;
}

export interface PointApiResponse {
  data: PointRecord[];
  error: string | null;
}
