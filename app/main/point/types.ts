export interface PointRecord {
  date: string;
  earned: number;
  used: number;
}

export interface PointRow extends PointRecord {
  total?: number;
}


