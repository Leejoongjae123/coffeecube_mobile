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

// 네이버 경로 API 응답 타입
export interface NaverRouteResponse {
  code: number;
  message: string;
  currentDateTime: string;
  route: {
    traoptimal: Array<{
      summary: {
        start: {
          location: [number, number]; // [경도, 위도]
        };
        goal: {
          location: [number, number];
        };
        distance: number; // 미터
        duration: number; // 밀리초
        departureTime: string;
        bbox: [[number, number], [number, number]];
        tollFare: number; // 통행료
        taxiFare: number; // 택시요금
        fuelPrice: number; // 유류비
      };
      path: Array<[number, number]>; // 경로 좌표 배열
      section: Array<{
        pointIndex: number;
        pointCount: number;
        distance: number;
        name: string;
        congestion: number;
        speed: number;
      }>;
      guide: Array<{
        pointIndex: number;
        type: number;
        instructions: string;
        distance: number;
        duration: number;
      }>;
    }>;
  };
}

// 카카오 지도 API 타입 정의
