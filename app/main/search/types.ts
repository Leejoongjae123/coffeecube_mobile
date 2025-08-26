export type RobotStatus = '수거 대상' | '장애 발생' | '정상 운영';

export interface RobotData {
  id: string;
  code: string;
  status: RobotStatus;
  address: string;
  installDate: string;
  currentCollection: string;
  lastCollection: string;
  latitude?: number;
  longitude?: number;
}

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  type: 'collection' | 'error' | 'normal';
  robotId: string;
}
