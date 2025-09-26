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
          geocode?: (
            options: { query: string },
            callback: (status: number, response: unknown) => void
          ) => void;
          reverseGeocode: (
            options: { coords: NaverLatLng; orders?: string },
            callback: (
              status: number,
              response: {
                v2?: {
                  results?: unknown[];
                  addresses?: Array<{
                    roadAddress?: string;
                    jibunAddress?: string;
                  }>;
                };
              }
            ) => void
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
    naverMapLoaded?: boolean;
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
          console.log("[reverseGeocode] start", { lat, lng });
          const attemptReverse = () => {
            // 네이버 지도 API가 있는 경우 시도
            if (
              window.naver?.maps?.Service?.reverseGeocode &&
              window.naver?.maps?.LatLng
            ) {
              const latlng = new window.naver.maps.LatLng(lat, lng);
              console.log(
                "[reverseGeocode] Naver API ready, calling reverseGeocode"
              );

              window.naver.maps.Service.reverseGeocode(
                {
                  coords: latlng,
                  // 도로명/지번 모두 요청 (배열 형식으로 전달)
                  orders: [
                    window.naver.maps.Service.OrderType.ADDR,
                    window.naver.maps.Service.OrderType.ROAD_ADDR,
                  ].join(","),
                },
                (
                  status: number,
                  response: {
                    v2?: {
                      results?: unknown[];
                      addresses?: Array<{
                        roadAddress?: string;
                        jibunAddress?: string;
                      }>;
                    };
                  }
                ) => {
                  console.log("[reverseGeocode] cb status:", status);
                  console.log("[reverseGeocode] response:", response);

                  if (status === window.naver.maps.Service.Status.ERROR) {
                    console.error("[reverseGeocode] API Error");
                    resolve(null);
                    return;
                  }

                  try {
                    // 1) v2.results 우선 처리 (샘플 코드 호환)
                    const results = response?.v2?.results || [];
                    console.log("[reverseGeocode] v2.results:", results);

                    // 네이버 지도 API 문서에 따른 makeAddress 함수
                    interface NaverAddressItem {
                      name?: string;
                      region?: {
                        area1?: { name?: string };
                        area2?: { name?: string };
                        area3?: { name?: string };
                        area4?: { name?: string };
                      };
                      land?: {
                        name?: string;
                        number1?: string;
                        number2?: string;
                      };
                    }

                    const makeAddress = (item: NaverAddressItem): string => {
                      if (!item) {
                        return "";
                      }

                      const name = item.name || "";
                      const region = item.region || {};
                      const land = item.land || {};

                      const sido = region.area1?.name || "";
                      const sigugun = region.area2?.name || "";
                      const dongmyun = region.area3?.name || "";
                      const ri = region.area4?.name || "";

                      const rest =
                        name === "roadaddr"
                          ? (land.name || "") +
                            " " +
                            (land.number1 || "") +
                            (land.number2 ? "-" + land.number2 : "")
                          : (land.number1 || "") +
                            (land.number2 ? "-" + land.number2 : "");

                      return [sido, sigugun, dongmyun, ri, rest]
                        .filter(Boolean)
                        .join(" ")
                        .trim();
                    };

                    if (
                      status === window.naver.maps.Service.Status.OK &&
                      Array.isArray(results) &&
                      results.length > 0
                    ) {
                      const road = (results as Array<{ name?: string }>).find(
                        (r) => r?.name === "roadaddr"
                      );
                      // 도로명 주소 우선
                      const roadItem = road || results[0];
                      const addrFromResult = makeAddress(
                        roadItem as NaverAddressItem
                      );
                      console.log(
                        "[reverseGeocode] picked from results:",
                        addrFromResult
                      );
                      if (addrFromResult) {
                        resolve(addrFromResult);
                        return;
                      }
                    }

                    // 2) fallback: v2.addresses 처리
                    const addr0 = response?.v2?.addresses?.[0];
                    console.log(
                      "[reverseGeocode] raw response addr[0]:",
                      addr0
                    );
                    if (
                      status === window.naver.maps.Service.Status.OK &&
                      addr0
                    ) {
                      const address =
                        addr0.roadAddress || addr0.jibunAddress || null;
                      console.log("[reverseGeocode] picked address:", address);
                      if (address) {
                        resolve(address);
                        return;
                      }
                    }
                  } catch {}
                  resolve(null);
                }
              );
            } else {
              console.log(
                "[reverseGeocode] geocoder not ready, retry in 300ms"
              );
              setTimeout(() => {
                attemptCount += 1;
                if (attemptCount < 6) {
                  attemptReverse();
                } else {
                  console.log(
                    "[reverseGeocode] geocoder not available, giving up"
                  );
                  resolve(null);
                }
              }, 300);
            }
          };

          let attemptCount = 0;
          attemptReverse();
        } catch {
          console.log("[reverseGeocode] exception raised, returning null");
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
            console.log("[getCurrentLocation] coords:", {
              latitude,
              longitude,
            });

            // 좌표 정보를 먼저 저장
            setCurrentLocationCoords({ latitude, longitude });

            // 역지오코딩 완료 후에만 주소 설정 (좌표 문자열 표시 방지)
            const address = await reverseGeocode(latitude, longitude);
            console.log("[getCurrentLocation] reverseGeocode result:", address);

            // 도로명 주소가 없을 수 있어 지번 주소까지 포함해 시도했으나,
            // 결과가 없으면 임시로 '내 위치'로 표기
            const finalAddress = address || "내 위치";
            console.log(
              "[getCurrentLocation] final departure address:",
              finalAddress
            );

            // 현재 위치 주소 및 출발지 동기화
            setCurrentLocationAddress(finalAddress);
            setDeparture({ address: finalAddress, latitude, longitude });
            console.log("[getCurrentLocation] setDeparture committed");

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
