export type RobotStatus = "수거필요" | "장애발생" | "정상";

export interface RobotData {
  id: string;
  code: string;
  name?: string;
  status: RobotStatus;
  address: string;
  install_location_raw?: string; // geocode에 사용할 원본 주소
  region_si?: string;
  region_dong?: string;
  coordinates_x?: string;
  coordinates_y?: string;
  installDate: string;
  currentCollection: string;
  temperature?: string;
  lastCollection: string;
  latitude?: number;
  longitude?: number;
  usable?: boolean;
}

export interface SearchResult {
  id: string;
  code: string;
  name?: string;
  status: RobotStatus;
  address: string;
  install_location_raw?: string; // geocode에 사용할 원본 주소
  region_si?: string;
  region_dong?: string;
  coordinates_x?: string;
  coordinates_y?: string;
  installDate: string;
  currentCollection: string;
  temperature?: string;
  lastCollection: string;
  usable?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  error?: string;
}

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  type: "collection" | "error" | "normal";
  robotId: string;
}

export interface SelectedLocation {
  id: string;
  code: string;
  name?: string;
  address: string;
  install_location_raw?: string; // geocode에 사용할 원본 주소
  latitude?: number;
  longitude?: number;
  status: RobotStatus;
}

// 경로 정보 인터페이스
export interface RouteInfo {
  departure: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  destination: {
    address: string;
    latitude?: number;
    longitude?: number;
    robotId: string;
    robotCode: string;
  };
}

// 카카오 지도 API 타입 정의
