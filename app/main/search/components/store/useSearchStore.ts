"use client";

import { create } from "zustand";
import {
  SearchResult,
  SelectedLocation,
  RouteInfo,
} from "@/app/main/search/types";

export interface SearchState {
  selectedLocation: SelectedLocation | null;
  searchType: "address" | "code" | null;
  searchResults: SelectedLocation[];
  routeInfo: RouteInfo | null;
  currentLocationAddress: string | null;
  currentLocationCoords: { latitude: number; longitude: number } | null;
  isDestinationSet: boolean;
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
}

export const useSearchStore = create<SearchState>((set, get) => ({
  selectedLocation: null,
  searchType: null,
  searchResults: [],
  routeInfo: null,
  currentLocationAddress: null,
  currentLocationCoords: null,
  isDestinationSet: false,
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
  clearRoute: () => set({ routeInfo: null, isDestinationSet: false }),
}));
