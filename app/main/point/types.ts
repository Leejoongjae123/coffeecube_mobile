export interface PointRecord {
  id: string;
  user_id: string;
  points: number; // 합계값 (earned - used)
  transaction_type: "earned" | "used";
  description: string; // points_source
  created_at: string;
  date: string; // earned_date에서 변환된 날짜 문자열
  earned: number; // 일자별 취득 포인트 합계
  used: number; // 일자별 차감 포인트 합계 (현재는 0)
}

export interface PointRow extends PointRecord {
  total?: number;
}

export interface PointApiResponse {
  data: PointRecord[];
  error: string | null;
}
