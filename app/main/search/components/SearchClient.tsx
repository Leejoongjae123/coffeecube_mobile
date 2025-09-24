"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import SearchModal from "./SearchModal";
import { RobotData, SearchResponse } from "../types";
import SearchInputButton from "@/app/main/search/components/SearchInputButton";
import RobotList from "@/app/main/search/components/RobotList";
import { useSearchStore } from "./store/useSearchStore";
import { useCurrentLocation } from "./hooks/useCurrentLocation";
import { Badge } from "@/components/ui/badge";

// 네이버 지도 API 타입 정의
interface NaverGeocodeResult {
  x: string;
  y: string;
  roadAddress: string;
  jibunAddress: string;
}

interface NaverGeocodeResponse {
  v2: {
    addresses: NaverGeocodeResult[];
  };
}

interface NaverLatLng {
  lat: () => number;
  lng: () => number;
}

interface NaverMap {
  setCenter: (position: NaverLatLng) => void;
  getCenter: () => NaverLatLng;
  setZoom: (zoom: number) => void;
  getZoom: () => number;
}

interface NaverMarker {
  setPosition: (position: NaverLatLng) => void;
  getPosition: () => NaverLatLng;
  setMap: (map: NaverMap | null) => void;
}

interface NaverMapOptions {
  center: NaverLatLng;
  zoom: number;
  mapTypeControl?: boolean;
  zoomControl?: boolean;
}

interface NaverMarkerOptions {
  position: NaverLatLng;
  map: NaverMap;
  title?: string;
  icon?:
    | string
    | {
        content: string;
        anchor: { x: number; y: number };
      };
}

declare global {
  interface Window {
    naver: {
      maps: {
        Service: {
          geocode: (
            options: { query: string },
            callback: (status: number, response: NaverGeocodeResponse) => void
          ) => void;
          reverseGeocode: (
            options: { coords: NaverLatLng; orders?: string },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            callback: (status: number, response: any) => void
          ) => void;
          Status: {
            OK: number;
          };
          OrderType: {
            ADDR: string;
            ROAD_ADDR: string;
          };
        };
        LatLng: new (lat: number, lng: number) => NaverLatLng;
        Map: new (element: HTMLElement, options: NaverMapOptions) => NaverMap;
        Marker: new (options: NaverMarkerOptions) => NaverMarker;
        Point: new (x: number, y: number) => { x: number; y: number };
      };
    };
    naverMapLoaded: boolean;
    naverGeocoderLoaded: boolean;
  }
}

export default function SearchClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(300); // 초기 높이를 줄임
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(500); // 기본값
  const [windowHeight, setWindowHeight] = useState(800); // 기본값
  const [robots, setRobots] = useState<RobotData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentLocationMarker, setCurrentLocationMarker] =
    useState<NaverMarker | null>(null);
  const robotMarkersRef = useRef<NaverMarker[]>([]);

  // useCurrentLocation hook 사용
  const { getCurrentLocation, isGettingLocation } = useCurrentLocation();

  // 네이버 지도 로고/축척 숨기기
  useEffect(() => {
    const hideNaverMapElements = () => {
      // 네이버 로고 숨기기
      const logoElements = document.querySelectorAll(
        ".naver-maps-logo, .naver-maps-attr"
      );
      logoElements.forEach((element) => {
        (element as HTMLElement).style.display = "none";
      });

      // 축척 숨기기
      const scaleElements = document.querySelectorAll(".naver-maps-scale");
      scaleElements.forEach((element) => {
        (element as HTMLElement).style.display = "none";
      });

      // Naver Corp 텍스트 숨기기
      const corpElements = document.querySelectorAll(
        '[title*="Naver"], [alt*="Naver"]'
      );
      corpElements.forEach((element) => {
        (element as HTMLElement).style.display = "none";
      });
    };

    // 지도 로드 후 약간의 지연을 두고 실행
    const timer = setInterval(hideNaverMapElements, 100);

    // 30초 후 타이머 정리 (충분한 시간)
    const cleanup = setTimeout(() => {
      clearInterval(timer);
    }, 30000);

    return () => {
      clearInterval(timer);
      clearTimeout(cleanup);
    };
  }, []);

  // 지도 제거로 인해 선택된 위치 상태는 유지하지 않음
  // 개별 상태를 직접 구독하여 무한 루프 방지
  const selectedLocation = useSearchStore((state) => state.selectedLocation);
  const setSearchResultsFromApi = useSearchStore(
    (state) => state.setSearchResultsFromApi
  );
  const isDestinationSet = useSearchStore((state) => state.isDestinationSet);
  const routeInfo = useSearchStore((state) => state.routeInfo);
  const clearRoute = useSearchStore((state) => state.clearRoute);
  const clearSearchResults = useSearchStore(
    (state) => state.clearSearchResults
  );
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<NaverMap | undefined>(undefined);

  // 주소 전처리 및 재시도 유틸리티
  const sanitizeAddress = useCallback((address: string) => {
    if (!address) {
      return "";
    }
    // 괄호 안 내용 제거, 다중 공백 정리
    const noParentheses = address.replace(/\s*\([^)]*\)\s*/g, " ");
    return noParentheses.replace(/\s+/g, " ").trim();
  }, []);

  const expandProvinceName = useCallback((address: string) => {
    if (!address) {
      return "";
    }
    const provinceMap: Record<string, string> = {
      서울: "서울특별시",
      부산: "부산광역시",
      대구: "대구광역시",
      인천: "인천광역시",
      광주: "광주광역시",
      대전: "대전광역시",
      울산: "울산광역시",
      세종: "세종특별자치시",
      경기: "경기도",
      강원: "강원특별자치도",
      충북: "충청북도",
      충남: "충청남도",
      전북: "전북특별자치도",
      전남: "전라남도",
      경북: "경상북도",
      경남: "경상남도",
      제주: "제주특별자치도",
    };
    return address.replace(/^(\S+)/, (match) => provinceMap[match] || match);
  }, []);

  const buildAddressCandidates = useCallback(
    (address: string, alt?: string) => {
      const candidates: string[] = [];

      const pushUnique = (v?: string) => {
        if (v && v.trim() && !candidates.includes(v.trim())) {
          candidates.push(v.trim());
        }
      };

      pushUnique(address);
      pushUnique(alt);

      // 각 후보에 대해 전처리/광역자치단체 확장 버전 추가
      [...candidates].forEach((base) => {
        const sanitized = sanitizeAddress(base);
        pushUnique(sanitized);

        const expanded = expandProvinceName(base);
        pushUnique(expanded);

        const expandedSanitized = sanitizeAddress(expanded);
        pushUnique(expandedSanitized);
      });

      return candidates;
    },
    [sanitizeAddress, expandProvinceName]
  );

  const geocodeOnce = useCallback((query: string) => {
    return new Promise<{ lat: number; lng: number } | null>((resolve) => {
      if (
        !window.naverGeocoderLoaded ||
        !window.naver?.maps?.Service?.geocode
      ) {
        resolve(null);
        return;
      }
      window.naver.maps.Service.geocode(
        { query },
        (status: number, response: NaverGeocodeResponse) => {
          if (status === window.naver.maps.Service.Status.OK) {
            const r = response.v2?.addresses?.[0];
            if (r && r.x && r.y) {
              resolve({ lat: parseFloat(r.y), lng: parseFloat(r.x) });
              return;
            }
          }
          resolve(null);
        }
      );
    });
  }, []);

  // 현재 위치를 가져와서 지도에 마커 표시하는 함수
  const handleGetCurrentLocation = useCallback(async () => {
    try {
      await getCurrentLocation();

      // 현재 위치 좌표 가져오기
      const currentLocationCoords =
        useSearchStore.getState().currentLocationCoords;

      if (currentLocationCoords && mapRef.current && window.naver?.maps) {
        const { latitude, longitude } = currentLocationCoords;

        // 기존 현재 위치 마커 제거
        if (currentLocationMarker) {
          currentLocationMarker.setMap(null);
        }

        // 새로운 위치로 지도 중심 이동
        const newCenter = new window.naver.maps.LatLng(latitude, longitude);
        mapRef.current.setCenter(newCenter);
        mapRef.current.setZoom(16); // 현재 위치에 맞는 적절한 줌 레벨

        // 현재 위치에 특별한 마커 표시
        const marker = new window.naver.maps.Marker({
          position: newCenter,
          map: mapRef.current,
          title: "현재 위치",
          icon: {
            content: [
              '<div style="',
              "  width: 20px;",
              "  height: 20px;",
              "  background: #007bff;",
              "  border: 3px solid white;",
              "  border-radius: 50%;",
              "  box-shadow: 0 2px 6px rgba(0,0,0,0.3);",
              "  position: relative;",
              '">',
              '  <div style="',
              "    width: 40px;",
              "    height: 40px;",
              "    background: rgba(0,123,255,0.2);",
              "    border-radius: 50%;",
              "    position: absolute;",
              "    top: -13px;",
              "    left: -13px;",
              "    animation: pulse 2s infinite;",
              '  "></div>',
              "</div>",
              "<style>",
              "  @keyframes pulse {",
              "    0% { transform: scale(0.8); opacity: 1; }",
              "    100% { transform: scale(2); opacity: 0; }",
              "  }",
              "</style>",
            ].join(""),
            anchor: new window.naver.maps.Point(10, 10),
          },
        });

        setCurrentLocationMarker(marker);
      }
    } catch (error) {
      // 에러는 hook에서 처리됨
    }
  }, [getCurrentLocation, currentLocationMarker]);

  // 맵 상태를 초기화하는 함수
  const resetMapToInitialState = useCallback(() => {
    // 상태 초기화
    clearSearchResults();
    clearRoute();

    // 현재 위치 마커 제거
    if (currentLocationMarker) {
      currentLocationMarker.setMap(null);
      setCurrentLocationMarker(null);
    }

    // 기존 로봇 마커들 제거
    robotMarkersRef.current.forEach((marker) => marker.setMap(null));
    robotMarkersRef.current = [];

    // 지도를 서울시청으로 이동하고 기본 줌 레벨로 설정
    if (mapRef.current && window.naver?.maps) {
      const defaultCenter = new window.naver.maps.LatLng(37.5665, 126.978); // 서울시청
      mapRef.current.setCenter(defaultCenter);
      mapRef.current.setZoom(15);

      // 로봇 마커들 다시 표시
      const newMarkers: NaverMarker[] = [];
      robots.forEach((robot) => {
        if (robot.coordinates_y && robot.coordinates_x && mapRef.current) {
          const marker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(
              parseFloat(robot.coordinates_y),
              parseFloat(robot.coordinates_x)
            ),
            map: mapRef.current,
          });
          newMarkers.push(marker);
        }
      });
      robotMarkersRef.current = newMarkers;
    }
  }, [clearSearchResults, clearRoute, currentLocationMarker, robots]);

  // 로봇 마커들을 생성하는 함수
  const createRobotMarkers = useCallback(() => {
    if (!mapRef.current || !window.naver?.maps || robots.length === 0) {
      return;
    }

    // 기존 로봇 마커들 제거
    robotMarkersRef.current.forEach((marker) => marker.setMap(null));

    // 새로운 로봇 마커들 생성
    const newMarkers: NaverMarker[] = [];
    robots.forEach((robot) => {
      if (robot.coordinates_y && robot.coordinates_x && mapRef.current) {
        const currentMap = mapRef.current;
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(
            parseFloat(robot.coordinates_y),
            parseFloat(robot.coordinates_x)
          ),
          map: currentMap,
          // 마커 아이콘 커스텀 (필요시 추가)
        });
        newMarkers.push(marker);
      }
    });
    robotMarkersRef.current = newMarkers;
  }, [robots]);

  useEffect(() => {
    const initializeMap = () => {
      if (window.naverMapLoaded && window.naver && window.naver.maps) {
        const mapContainer = document.getElementById("myMap");
        if (mapContainer && !mapRef.current) {
          // 초기 지도 중심점 설정
          // 1. selectedLocation이 있으면 사용
          // 2. 없으면 첫 번째 로봇의 좌표 사용
          // 3. 둘 다 없으면 서울시청을 기본값으로
          let centerCoordinates;

          if (
            selectedLocation &&
            selectedLocation.latitude &&
            selectedLocation.longitude
          ) {
            centerCoordinates = new window.naver.maps.LatLng(
              selectedLocation.latitude,
              selectedLocation.longitude
            );
          } else if (
            robots.length > 0 &&
            robots[0].coordinates_y &&
            robots[0].coordinates_x
          ) {
            centerCoordinates = new window.naver.maps.LatLng(
              parseFloat(robots[0].coordinates_y),
              parseFloat(robots[0].coordinates_x)
            );
          } else {
            centerCoordinates = new window.naver.maps.LatLng(37.5665, 126.978); // 기본값: 서울시청
          }

          const mapOptions = {
            center: centerCoordinates,
            zoom: 15,
            mapTypeControl: false,
            zoomControl: false,
          };
          const map = new window.naver.maps.Map(mapContainer, mapOptions);
          mapRef.current = map;
        }

        // 지도가 생성된 후 로봇 마커들 생성
        if (mapRef.current) {
          createRobotMarkers();
        }
      }
    };

    // 네이버 지도 API가 이미 로드되었다면 즉시 초기화
    if (window.naverMapLoaded) {
      initializeMap();
    } else {
      // 네이버 지도 API 로딩 완료를 기다림
      const handleNaverMapReady = () => {
        initializeMap();
      };

      window.addEventListener("naverMapReady", handleNaverMapReady);

      return () => {
        window.removeEventListener("naverMapReady", handleNaverMapReady);
      };
    }
  }, [robots, selectedLocation, createRobotMarkers]);

  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      const primary =
        selectedLocation.install_location_raw || selectedLocation.address;
      if (!primary) {
        console.warn("geocode할 주소가 없습니다:", selectedLocation);
        return;
      }

      let isComponentMounted = true;

      const executeGeocode = async () => {
        if (!isComponentMounted) {
          return;
        }

        const candidates = buildAddressCandidates(
          primary,
          selectedLocation.address !== primary
            ? selectedLocation.address
            : undefined
        );

        console.log("=== 주소 검색 시도 후보 ===");
        candidates.forEach((c, i) => console.log(`#${i + 1}:`, c));
        console.log("======================");

        for (const candidate of candidates) {
          if (!isComponentMounted) {
            return;
          }
          const result = await geocodeOnce(candidate);
          if (result && mapRef.current) {
            console.log("주소 검색 성공:", candidate);
            console.log(`위도: ${result.lat}, 경도: ${result.lng}`);
            const newCenter = new window.naver.maps.LatLng(
              result.lat,
              result.lng
            );
            const currentMap = mapRef.current;
            currentMap.setCenter(newCenter);
            new window.naver.maps.Marker({
              position: newCenter,
              map: currentMap,
            });
            return;
          }
        }

        console.log("모든 주소 후보에 대해 좌표 변환 실패");
      };

      if (window.naverGeocoderLoaded) {
        executeGeocode();
      } else {
        const handleNaverMapReady = () => {
          executeGeocode();
        };
        window.addEventListener("naverMapReady", handleNaverMapReady);
        return () => {
          isComponentMounted = false;
          window.removeEventListener("naverMapReady", handleNaverMapReady);
        };
      }

      return () => {
        isComponentMounted = false;
      };
    }
  }, [selectedLocation, buildAddressCandidates, geocodeOnce]);

  const minHeight = 120; // 최소 높이를 줄임 (핸들과 타이틀만 보이도록)
  const bottomNavbarHeight = 80; // Bottom Navbar 높이 (pb-20 = 80px)

  // 장비 데이터 가져오기
  useEffect(() => {
    const fetchRobots = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/equipment/list");
        const data: SearchResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "데이터를 가져오는 중 오류가 발생했습니다."
          );
        }

        setRobots(data.results);
        setSearchResultsFromApi(data.results);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRobots();
  }, [setSearchResultsFromApi]);

  // windowHeight와 maxHeight 업데이트
  React.useEffect(() => {
    const updateWindowHeight = () => {
      setWindowHeight(window.innerHeight);
    };

    updateWindowHeight();
    window.addEventListener("resize", updateWindowHeight);

    return () => window.removeEventListener("resize", updateWindowHeight);
  }, []);

  // maxHeight 계산을 windowHeight에 따라 업데이트 (Bottom Navbar 높이 고려)
  React.useEffect(() => {
    const availableHeight = windowHeight - bottomNavbarHeight;
    setMaxHeight(availableHeight * 0.85); // 최대 높이를 화면의 85%로 제한
  }, [windowHeight]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setStartY(e.clientY);
      setStartHeight(bottomSheetHeight);
    },
    [bottomSheetHeight]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setStartY(e.touches[0].clientY);
      setStartHeight(bottomSheetHeight);
    },
    [bottomSheetHeight]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) {
        return;
      }

      const deltaY = startY - e.clientY;
      const newHeight = Math.max(
        minHeight,
        Math.min(maxHeight, startHeight + deltaY)
      );
      setBottomSheetHeight(newHeight);
    },
    [isDragging, startY, startHeight, minHeight, maxHeight]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) {
        return;
      }

      e.preventDefault();
      const deltaY = startY - e.touches[0].clientY;
      const newHeight = Math.max(
        minHeight,
        Math.min(maxHeight, startHeight + deltaY)
      );
      setBottomSheetHeight(newHeight);
    },
    [isDragging, startY, startHeight, minHeight, maxHeight]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);

    // 개선된 스냅 포인트 기능 - 3단계로 설정
    const snapPoints = [
      minHeight, // 최소 (핸들과 타이틀만)
      maxHeight * 0.5, // 중간 (리스트 일부 표시)
      maxHeight, // 최대 (전체 리스트)
    ];

    let closestSnap = snapPoints[0];
    let minDistance = Math.abs(bottomSheetHeight - snapPoints[0]);

    snapPoints.forEach((point) => {
      const distance = Math.abs(bottomSheetHeight - point);
      if (distance < minDistance) {
        minDistance = distance;
        closestSnap = point;
      }
    });

    setBottomSheetHeight(closestSnap);
  }, [bottomSheetHeight, minHeight, maxHeight]);

  // 전역 이벤트 리스너 등록
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  // 초기 자동 위치 가져오기 제거 - 버튼 클릭 시에만 위치를 가져옵니다

  // 컴포넌트 언마운트 시 마커 정리
  React.useEffect(() => {
    return () => {
      if (currentLocationMarker) {
        currentLocationMarker.setMap(null);
      }
      robotMarkersRef.current.forEach((marker) => marker.setMap(null));
    };
  }, [currentLocationMarker]);

  // 상단 MapArea 높이를 바텀 시트 높이에 따라 동적으로 계산
  const containerHeight = windowHeight - bottomNavbarHeight;

  return (
    <div
      className="relative bg-white w-full overflow-hidden"
      style={{ height: `${containerHeight}px` }}
    >
      {/* 전체 화면을 차지하는 빈 회색 영역 */}
      <div id="myMap" className="w-full h-full" />

      {/* 검색 버튼은 MapArea 위에 고정 */}
      <div className="absolute top-0 left-0 w-full z-10">
        <SearchInputButton onOpen={() => setIsModalOpen(true)} />
      </div>

      {/* 도착지가 설정된 경우 출발-도착 표시 */}
      {isDestinationSet && routeInfo && (
        <div className="absolute left-5 z-10 top-[23px] max-md:inset-x-5 max-sm:inset-x-4 h-24 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 flex flex-col justify-between w-[316px]">
          {/* 출발지 */}
          <div className="flex items-center gap-3">
            <Badge className="w-[34px] h-[24px] bg-[#D6D6D6] text-[#4E4E4E] text-[10px] rounded-[100px] flex items-center justify-center shadow-none px-1">
              출발
            </Badge>
            <div className="text-sm text-gray-700 truncate flex-1">
              {routeInfo.departure.address}
            </div>
            <Image
              className="cursor-pointer"
              src="/cancel.svg"
              alt="cancel"
              width={24}
              height={24}
              onClick={resetMapToInitialState}
            />
          </div>

          {/* 구분선 */}
          <div className="border-t border-[#D5D5D5] my-1"></div>

          {/* 도착지 */}
          <div className="flex items-center gap-3">
            <Badge className="w-[34px] h-[24px] bg-primary text-white text-[10px] rounded-[100px] flex items-center justify-center shadow-none px-1">
              도착
            </Badge>
            <div className="text-sm text-gray-700 truncate flex-1">
              {routeInfo.destination.address}
            </div>
          </div>
        </div>
      )}

      {/* 내 위치 버튼 */}
      <div
        className={`absolute right-0 flex gap-2.5 justify-end items-center px-5 py-3 w-full z-20 ${
          isDragging ? "" : "transition-all duration-200 ease-out"
        }`}
        style={{ bottom: `${bottomSheetHeight + 10}px` }}
      >
        <button
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className={`flex items-center justify-center w-[48px] h-[48px] rounded-lg shadow-lg transition-all duration-200 ${
            isGettingLocation
              ? "bg-blue-100 border-2 border-blue-300 cursor-not-allowed animate-pulse"
              : "bg-white hover:bg-blue-50 hover:border-blue-600 active:scale-95 cursor-pointer"
          }`}
          title={isGettingLocation ? "위치를 가져오는 중..." : "내 위치로 이동"}
        >
          <Image
            src="/mypoint.svg"
            width={20}
            height={20}
            alt="mypoint"
            className={`${
              isGettingLocation ? "animate-spin" : ""
            } transition-transform duration-200`}
          />
        </button>
      </div>

      {/* 드래그 가능한 Bottom Sheet */}
      <div
        ref={bottomSheetRef}
        className={`absolute bottom-0 left-0 flex flex-col w-full bg-white shadow-lg shadow-gray-500/20 rounded-[20px_20px_0_0] overflow-hidden ${
          isDragging ? "" : "transition-all duration-300 ease-out"
        }`}
        style={{ height: `${bottomSheetHeight}px` }}
      >
        {/* 드래그 핸들 영역 */}
        <div
          className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing select-none bg-white"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* 핸들 바 */}
          <div className="h-1.5 bg-gray-300 hover:bg-gray-400 rounded-full w-12 transition-colors duration-200" />
        </div>

        {/* 스크롤 가능한 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col px-6 pb-20 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* selectedLocation이 없을 때만 제목 표시 */}
          {!selectedLocation && (
            <div className="text-base font-bold text-zinc-900 max-sm:text-sm mb-3">
              내 주변 비니봇
            </div>
          )}

          {error && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {isLoading ? (
            <div className="w-full flex justify-center py-8">
              <div className="text-sm text-gray-500">로딩 중...</div>
            </div>
          ) : robots.length === 0 && !error ? (
            <div className="w-full flex justify-center py-8">
              <div className="text-sm text-gray-500">
                주변에 장비가 없습니다.
              </div>
            </div>
          ) : (
            <RobotList
              robots={
                selectedLocation
                  ? robots.filter((robot) => robot.id === selectedLocation.id)
                  : robots
              }
            />
          )}
        </div>
      </div>

      <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
