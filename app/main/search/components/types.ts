// Minimal Kakao Maps types used in this feature

export type KakaoLatLng = unknown;

export interface KakaoMaps {
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number }
  ) => unknown;
  load?: (callback: () => void) => void;
}

export interface KakaoNamespace {
  maps: KakaoMaps;
}

declare global {
  interface Window {
    kakao?: KakaoNamespace;
  }
  const kakao: KakaoNamespace;
}

export {};
