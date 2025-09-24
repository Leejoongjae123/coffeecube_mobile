"use client";

import { useState, useCallback } from "react";
import { useSearchStore } from "../store/useSearchStore";

// 네이버 지도 API 타입 정의
interface NaverLatLng {
  lat: () => number;
  lng: () => number;
}

declare global {
  interface Window {
    naver: {
      maps: {
        Service: {
          reverseGeocode: (
            options: { coords: NaverLatLng; orders?: string },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callback: (status: number, response: any) => void
          ) => void;
          Status: {
            OK: number;
          };
          OrderType: {
            ROAD_ADDR: string;
            ADDR: string;
          };
        };
        LatLng: new (lat: number, lng: number) => NaverLatLng;
      };
    };
    naverGeocoderLoaded: boolean;
  }
}

export const useCurrentLocation = () => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const setCurrentLocationAddress = useSearchStore(
    (state) => state.setCurrentLocationAddress
  );
  const setCurrentLocationCoords = useSearchStore(
    (state) => state.setCurrentLocationCoords
  );
  const setDeparture = useSearchStore((state) => state.setDeparture);

  // 역지오코딩 함수 (좌표를 주소로 변환)
  const reverseGeocode = useCallback(
    (lat: number, lng: number): Promise<string | null> => {
      return new Promise((resolve) => {
        try {
          // 네이버 지도 API가 있는 경우 시도
          if (window.naver?.maps?.Service?.reverseGeocode) {
            const latlng = new window.naver.maps.LatLng(lat, lng);

            window.naver.maps.Service.reverseGeocode(
              {
                coords: latlng,
                orders: window.naver.maps.Service.OrderType.ROAD_ADDR,
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (status: number, response: any) => {
                if (status === window.naver.maps.Service.Status.OK) {
                  const result = response.v2?.addresses?.[0];
                  if (result) {
                    // 도로명 주소를 우선적으로 사용
                    const address =
                      result.roadAddress || result.jibunAddress || null;
                    if (address) {
                      resolve(address);
                      return;
                    }
                  }
                }
                resolve(null);
              }
            );
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    },
    []
  );

  const getCurrentLocation = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        alert(
          "현재 위치를 가져올 수 없습니다. 브라우저에서 위치 서비스를 지원하지 않습니다."
        );
        reject(new Error("Geolocation not supported"));
        return;
      }

      setIsGettingLocation(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // 좌표 정보를 먼저 저장
            setCurrentLocationCoords({ latitude, longitude });

            // 역지오코딩 완료 후에만 주소 설정 (좌표 문자열 표시 방지)
            const address = await reverseGeocode(latitude, longitude);

            // 도로명 주소가 없을 수 있어 지번 주소까지 포함해 시도했으나,
            // 결과가 없으면 임시로 '내 위치'로 표기
            const finalAddress = address || "내 위치";

            // 현재 위치 주소 및 출발지 동기화
            setCurrentLocationAddress(finalAddress);
            setDeparture({ address: finalAddress, latitude, longitude });

            setIsGettingLocation(false);
            resolve();
          } catch (error) {
            setIsGettingLocation(false);
            alert("현재 위치 정보를 처리하는 중 오류가 발생했습니다.");
            reject(error);
          }
        },
        (error) => {
          setIsGettingLocation(false);
          let errorMessage = "현재 위치를 가져올 수 없습니다.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "위치 정보 액세스가 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "위치 정보를 사용할 수 없습니다.";
              break;
            case error.TIMEOUT:
              errorMessage = "위치 정보 요청이 시간 초과되었습니다.";
              break;
          }

          alert(errorMessage);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000, // 1분간 캐시된 위치 정보 사용
        }
      );
    });
  }, [
    setCurrentLocationAddress,
    setCurrentLocationCoords,
    setDeparture,
    reverseGeocode,
  ]);

  return {
    getCurrentLocation,
    isGettingLocation,
    reverseGeocode,
  };
};
