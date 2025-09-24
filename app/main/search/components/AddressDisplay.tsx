"use client";

import React from "react";
import { useSearchStore } from "./store/useSearchStore";

export default function AddressDisplay() {
  const selectedLocation = useSearchStore((state) => state.selectedLocation);

  if (!selectedLocation) {
    return null;
  }

  // install_location_raw가 있으면 우선 사용, 없으면 address 사용
  const displayAddress =
    selectedLocation.install_location_raw || selectedLocation.address;

  return (
    <div className="absolute top-16 left-4 right-4 z-10">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 border border-gray-200">
        <div className="text-sm text-gray-600 mb-1">선택된 위치</div>
        <div className="text-base font-medium text-gray-900 break-words">
          {displayAddress}
        </div>
      </div>
    </div>
  );
}
