"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RobotData, RobotStatus } from "../types";
import { useSearchStore } from "./store/useSearchStore";
import { useCurrentLocation } from "./hooks/useCurrentLocation";

interface RobotListProps {
  robots: RobotData[];
}

const getStatusBadgeStyle = (status: RobotStatus) => {
  switch (status) {
    case "수거필요":
      return "w-20 px-2 py-1.5 bg-[#BEE8FE] text-sky-600 text-xs font-bold rounded-[100px] max-sm:px-1.5 max-sm:py-1  justify-center shadow-none";
    case "장애발생":
      return "w-20 px-2 py-1.5 bg-[#FFE0E2] text-rose-600 text-xs font-bold rounded-[100px] max-sm:px-1.5 max-sm:py-1  justify-center shadow-none";
    default:
      return "w-20 px-2 py-1.5 bg-[#C3EDC0] text-green-600 text-xs font-bold rounded-[100px] max-sm:px-1.5 max-sm:py-1  justify-center shadow-none";
  }
};

export default function RobotList({ robots }: RobotListProps) {
  const setDestination = useSearchStore((state) => state.setDestination);
  const setDeparture = useSearchStore((state) => state.setDeparture);
  const currentCoords = useSearchStore((state) => state.currentLocationCoords);
  const fetchRoute = useSearchStore((state) => state.fetchRoute);
  const { getCurrentLocation, isGettingLocation, reverseGeocode } =
    useCurrentLocation();

  const handleSetDestination = async (robot: RobotData) => {
    console.log("[RobotList] handleSetDestination start", {
      robotId: robot.id,
      robotCode: robot.code,
      coordinates_x: robot.coordinates_x,
      coordinates_y: robot.coordinates_y,
    });

    // 1) 현재 위치 확보 (좌표 저장됨)
    await getCurrentLocation();
    console.log("[RobotList] after getCurrentLocation");

    // 2) 저장된 좌표 기준으로 역지오코딩하여 출발지 주소를 도로명으로 보장
    const coords =
      useSearchStore.getState().currentLocationCoords || currentCoords;
    let departureAddress = "내 위치";
    if (
      coords &&
      typeof coords.latitude === "number" &&
      typeof coords.longitude === "number"
    ) {
      console.log("[RobotList] coords for reverseGeocode:", coords);
      const addr = await reverseGeocode(coords.latitude, coords.longitude);
      console.log("[RobotList] reverseGeocode result:", addr);
      departureAddress = addr || "내 위치";
      // 출발지 주소 및 좌표 동기화
      setDeparture({
        address: departureAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      console.log("[RobotList] setDeparture committed", {
        address: departureAddress,
        lat: coords.latitude,
        lng: coords.longitude,
      });
    }

    // 3) 도착지 설정 - 좌표 파싱 및 검증
    const robotLatitude = robot.coordinates_y
      ? parseFloat(robot.coordinates_y)
      : robot.latitude;
    const robotLongitude = robot.coordinates_x
      ? parseFloat(robot.coordinates_x)
      : robot.longitude;

    console.log("[RobotList] robot coordinates", {
      coordinates_x: robot.coordinates_x,
      coordinates_y: robot.coordinates_y,
      parsed_longitude: robotLongitude,
      parsed_latitude: robotLatitude,
      original_latitude: robot.latitude,
      original_longitude: robot.longitude,
    });

    if (!robotLatitude || !robotLongitude) {
      console.error("[RobotList] 로봇 좌표 정보가 없습니다:", robot);
      alert("해당 위치의 좌표 정보가 없어 길찾기를 할 수 없습니다.");
      return;
    }

    setDestination({
      id: robot.id,
      code: robot.code,
      address: robot.install_location_raw || robot.address,
      latitude: robotLatitude,
      longitude: robotLongitude,
    });
    console.log("[RobotList] setDestination committed", {
      id: robot.id,
      code: robot.code,
      address: robot.install_location_raw || robot.address,
    });

    // 4) 경로 찾기 시작
    console.log("[RobotList] 경로 찾기 시작");
    await fetchRoute();
  };

  return (
    <div className="flex flex-col gap-3 items-start w-full">
      {robots.map((robot) => (
        <div
          key={robot.id}
          className="flex flex-col gap-4 justify-center items-start px-4 py-5 w-full rounded-lg border-gray-200 border-solid bg-zinc-50 border-[1.4px] max-sm:px-3 max-sm:py-4"
        >
          <div className="flex flex-col gap-3 items-start w-full">
            <div className="flex flex-col gap-2 items-start w-full">
              <div className="flex justify-between items-center w-full">
                <Badge
                  className={`${getStatusBadgeStyle(robot.status)} shadow-none`}
                >
                  {robot.status}
                </Badge>
                <div className="text-xs text-center text-zinc-600 max-sm:text-xs">
                  {robot.installDate} 설치
                </div>
              </div>
              <div className="text-base text-zinc-900 max-sm:text-sm">
                {robot.address}
              </div>
            </div>
            <div className="text-xs leading-5 text-stone-500 max-sm:text-xs max-sm:leading-5">
              <span>코드 : {robot.code}</span>
              <br />
              <span>현재 수거량 : {robot.currentCollection}</span>

              <br />
              <span>
                마지막 수거 : {new Date(robot.lastCollection).toLocaleString()}
              </span>
            </div>
          </div>
          <Button
            onClick={() => handleSetDestination(robot)}
            disabled={isGettingLocation}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 h-[56px] flex items-center justify-center gap-2"
          >
            <Image src="/pin.svg" width={24} height={24} alt="pin" />
            {isGettingLocation ? "위치 확인 중..." : "도착지로 설정"}
          </Button>
        </div>
      ))}
    </div>
  );
}
