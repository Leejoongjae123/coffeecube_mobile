"use client";

import { create } from "zustand";
import {
  SearchResult,
  SelectedLocation,
  RouteInfo,
  NaverRouteResponse,
} from "@/app/main/search/types";
import {
  geocodeAddress,
  reverseGeocodeOnce,
  waitForNaverGeocoder,
  isInKoreaBounds,
} from "../lib/geocodingUtils";

export interface SearchState {
  selectedLocation: SelectedLocation | null;
  searchType: "address" | "code" | null;
  searchResults: SelectedLocation[];
  routeInfo: RouteInfo | null;
  routeData: NaverRouteResponse | null;
  currentLocationAddress: string | null;
  currentLocationCoords: { latitude: number; longitude: number } | null;
  isDestinationSet: boolean;
  isLoadingRoute: boolean;
  setSelectedLocation: (
    location: SelectedLocation | null,
    type: "address" | "code" | null
  ) => void;
  setSearchResultsFromApi: (results: SearchResult[]) => void;
  clearSearchResults: () => void;
  setDestination: (robotData: {
    id: string;
    code: string;
    address: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  setCurrentLocationAddress: (address: string) => void;
  setCurrentLocationCoords: (coords: {
    latitude: number;
    longitude: number;
  }) => void;
  setDeparture: (departureData: {
    address: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  clearRoute: () => void;
  setRouteData: (data: NaverRouteResponse | null) => void;
  setLoadingRoute: (loading: boolean) => void;
  fetchRoute: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  selectedLocation: null,
  searchType: null,
  searchResults: [],
  routeInfo: null,
  routeData: null,
  currentLocationAddress: null,
  currentLocationCoords: null,
  isDestinationSet: false,
  isLoadingRoute: false,
  setSelectedLocation: (location, type) =>
    set({ selectedLocation: location, searchType: type }),
  setSearchResultsFromApi: (results) =>
    set({
      searchResults: results
        .map((r) => ({
          id: r.id,
          code: r.code,
          name: r.name,
          address: r.address,
          install_location_raw: r.install_location_raw, // geocode에 사용할 원본 주소
          latitude: r.coordinates_y ? parseFloat(r.coordinates_y) : undefined,
          longitude: r.coordinates_x ? parseFloat(r.coordinates_x) : undefined,
          status: r.status,
        }))
        .filter(
          (r) =>
            typeof r.latitude === "number" && typeof r.longitude === "number"
        ),
    }),
  clearSearchResults: () =>
    set({ searchResults: [], searchType: null, selectedLocation: null }),
  setDestination: (robotData) => {
    const state = get();
    const routeInfo: RouteInfo = {
      departure: {
        address: state.currentLocationAddress || "내 위치",
        latitude: state.currentLocationCoords?.latitude,
        longitude: state.currentLocationCoords?.longitude,
      },
      destination: {
        address: robotData.address,
        latitude: robotData.latitude,
        longitude: robotData.longitude,
        robotId: robotData.id,
        robotCode: robotData.code,
      },
    };
    set({ routeInfo, isDestinationSet: true });
  },
  setCurrentLocationAddress: (address) =>
    set((state) => ({
      currentLocationAddress: address,
      routeInfo: state.routeInfo
        ? {
            ...state.routeInfo,
            departure: {
              ...state.routeInfo.departure,
              address,
            },
          }
        : state.routeInfo,
    })),
  setCurrentLocationCoords: (coords) => set({ currentLocationCoords: coords }),
  setDeparture: (departureData) => {
    const state = get();
    const newLocationCoords =
      departureData.latitude && departureData.longitude
        ? {
            latitude: departureData.latitude,
            longitude: departureData.longitude,
          }
        : null;

    if (state.routeInfo) {
      // 기존 routeInfo가 있을 때 departure만 업데이트
      const updatedRouteInfo: RouteInfo = {
        ...state.routeInfo,
        departure: {
          address: departureData.address,
          latitude: departureData.latitude,
          longitude: departureData.longitude,
        },
      };
      set({
        routeInfo: updatedRouteInfo,
        currentLocationAddress: departureData.address,
        currentLocationCoords: newLocationCoords,
      });
    } else {
      // routeInfo가 없으면 currentLocationAddress와 좌표만 업데이트
      set({
        currentLocationAddress: departureData.address,
        currentLocationCoords: newLocationCoords,
      });
    }
  },
  clearRoute: () =>
    set({ routeInfo: null, routeData: null, isDestinationSet: false }),
  setRouteData: (data) => set({ routeData: data }),
  setLoadingRoute: (loading) => set({ isLoadingRoute: loading }),
  fetchRoute: async () => {
    const state = get();

    console.log("[fetchRoute] 현재 상태:", {
      routeInfo: state.routeInfo,
      departure: state.routeInfo?.departure,
      destination: state.routeInfo?.destination,
    });

    if (!state.routeInfo) {
      console.log("[fetchRoute] routeInfo가 없습니다.");
      return;
    }

    const { departure, destination } = state.routeInfo;

    set({ isLoadingRoute: true });

    try {
      // 네이버 지오코딩 준비 대기
      const ready = await waitForNaverGeocoder();
      if (!ready) {
        alert(
          "네이버 지도 API가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요."
        );
        return;
      }

      // 출발 좌표 확정
      let finalDeparture = {
        latitude: departure.latitude,
        longitude: departure.longitude,
      } as { latitude?: number; longitude?: number };

      const depHasNumbers =
        typeof finalDeparture.latitude === "number" &&
        typeof finalDeparture.longitude === "number" &&
        !isNaN(finalDeparture.latitude as number) &&
        !isNaN(finalDeparture.longitude as number);
      const depInKorea = depHasNumbers
        ? isInKoreaBounds(
            finalDeparture.latitude as number,
            finalDeparture.longitude as number
          )
        : false;

      if (!depHasNumbers || !depInKorea) {
        console.log("[fetchRoute] 출발 좌표 재지오코딩 시도 (주소)", {
          address: departure.address,
          기존좌표: finalDeparture,
          depHasNumbers,
          depInKorea,
        });
        const geo = await geocodeAddress(departure.address);
        if (!geo) {
          alert(`출발지(\"${departure.address}\")의 좌표를 찾지 못했습니다.`);
          return;
        }
        finalDeparture = { latitude: geo.lat, longitude: geo.lng };
      }

      // 출발 좌표 reverseGeocode 로깅
      const depResolved = await reverseGeocodeOnce(
        finalDeparture.latitude as number,
        finalDeparture.longitude as number
      );
      console.log("[fetchRoute] 출발 좌표 확정", {
        latitude: finalDeparture.latitude,
        longitude: finalDeparture.longitude,
        reverseGeocodeAddress: depResolved,
      });

      // 도착 좌표 확정
      let finalDestination = {
        latitude: destination.latitude,
        longitude: destination.longitude,
      } as { latitude?: number; longitude?: number };

      const dstHasNumbers =
        typeof finalDestination.latitude === "number" &&
        typeof finalDestination.longitude === "number" &&
        !isNaN(finalDestination.latitude as number) &&
        !isNaN(finalDestination.longitude as number);
      const dstInKorea = dstHasNumbers
        ? isInKoreaBounds(
            finalDestination.latitude as number,
            finalDestination.longitude as number
          )
        : false;

      if (!dstHasNumbers || !dstInKorea) {
        console.log("[fetchRoute] 도착 좌표 재지오코딩 시도 (주소)", {
          address: destination.address,
          기존좌표: finalDestination,
          dstHasNumbers,
          dstInKorea,
        });
        const geo = await geocodeAddress(destination.address);
        if (!geo) {
          alert(`도착지(\"${destination.address}\")의 좌표를 찾지 못했습니다.`);
          return;
        }
        finalDestination = { latitude: geo.lat, longitude: geo.lng };
      }

      // 도착 좌표 reverseGeocode 로깅
      const dstResolved = await reverseGeocodeOnce(
        finalDestination.latitude as number,
        finalDestination.longitude as number
      );
      console.log("[fetchRoute] 도착 좌표 확정", {
        latitude: finalDestination.latitude,
        longitude: finalDestination.longitude,
        reverseGeocodeAddress: dstResolved,
      });

      // 한국 경계 최종 검증
      if (
        !isInKoreaBounds(
          finalDeparture.latitude as number,
          finalDeparture.longitude as number
        ) ||
        !isInKoreaBounds(
          finalDestination.latitude as number,
          finalDestination.longitude as number
        )
      ) {
        console.log("[fetchRoute] 한국 경계 밖 좌표", {
          departure: finalDeparture,
          destination: finalDestination,
        });
        alert(
          "출발지 또는 도착지 좌표가 한국 영역을 벗어났습니다. 주소를 확인해주세요."
        );
        return;
      }

      const start = `${finalDeparture.longitude},${finalDeparture.latitude}`;
      const goal = `${finalDestination.longitude},${finalDestination.latitude}`;

      console.log("[fetchRoute] API 호출 파라미터:", {
        start,
        goal,
        departure: { address: departure.address, ...finalDeparture },
        destination: { address: destination.address, ...finalDestination },
      });

      const response = await fetch(
        `/api/route/driving?start=${start}&goal=${goal}`
      );
      const data = await response.json();

      console.log("[fetchRoute] API 응답:", {
        status: response.status,
        ok: response.ok,
        data: data,
      });

      if (!response.ok) {
        alert((data && data.error) || "경로 찾기에 실패했습니다.");
        return;
      }

      console.log("[fetchRoute] 경로 찾기 성공:", data);
      set({ routeData: data });
    } catch (error) {
      console.log("[fetchRoute] 경로 찾기 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "경로 찾기 중 오류가 발생했습니다."
      );
    } finally {
      set({ isLoadingRoute: false });
    }
  },
}));
