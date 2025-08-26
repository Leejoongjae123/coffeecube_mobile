"use client";

import { useState } from "react";
import SearchModal from "@/components/SearchModal";
import { RobotData } from "../types";
import MapArea from "@/app/main/search/components/MapArea";
import SearchInputButton from "@/app/main/search/components/SearchInputButton";
import RobotList from "@/app/main/search/components/RobotList";

const dummyRobots: RobotData[] = [
  {
    id: "robot-001",
    code: "asdfghjkl001",
    status: "수거 대상",
    address: "경기도 시흥시 시청로 20 (장현동)",
    installDate: "2025-01-01",
    currentCollection: "75%",
    lastCollection: "2025-01-01-10:30:00",
    latitude: 37.5665,
    longitude: 126.9780,
  },
  {
    id: "robot-002",
    code: "qwertyui002",
    status: "장애 발생",
    address: "경기도 시흥시 정왕대로 53 (정왕동)",
    installDate: "2024-12-15",
    currentCollection: "12%",
    lastCollection: "2024-12-30-14:20:00",
    latitude: 37.3735,
    longitude: 126.7417,
  },
  {
    id: "robot-003",
    code: "zxcvbnm003",
    status: "수거 대상",
    address: "경기도 시흥시 은행로 47 (신천동)",
    installDate: "2024-11-20",
    currentCollection: "85%",
    lastCollection: "2025-01-01-08:15:00",
    latitude: 37.4050,
    longitude: 126.8029,
  },
  {
    id: "robot-004",
    code: "poiuytre004",
    status: "장애 발생",
    address: "경기도 시흥시 매화로 25 (매화동)",
    installDate: "2024-10-10",
    currentCollection: "45%",
    lastCollection: "2024-12-28-16:45:00",
    latitude: 37.4458,
    longitude: 126.7982,
  },
  {
    id: "robot-005",
    code: "mnbvcxz005",
    status: "수거 대상",
    address: "경기도 시흥시 목감로 15 (목감동)",
    installDate: "2024-09-05",
    currentCollection: "92%",
    lastCollection: "2025-01-01-12:00:00",
    latitude: 37.3259,
    longitude: 126.8343,
  },
];

export default function SearchClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative bg-white h-screen w-full">
      <MapArea />

      <SearchInputButton onOpen={() => setIsModalOpen(true)} />

      <div className="flex absolute left-0 flex-col gap-3 items-end h-[calc(100vh-229px)] top-[229px] w-full max-md:h-auto max-md:min-h-[500px]">
        <div className="flex gap-2.5 justify-end items-center px-5 py-0 w-full">
          <button className="flex items-center justify-center w-[40px] h-[40px] bg-gray-50 rounded-lg border border-gray-300 shadow-lg">
            <img src="/mypoint.svg" width={16} height={16} alt="mypoint" />
          </button>
        </div>

        <div className="flex flex-col gap-8 items-center px-6 py-3 w-full bg-white shadow-lg shadow-gray-500/10 flex-1 rounded-[20px_20px_0_0] gap-y-6 overflow-y-auto">
          <div className="h-1.5 bg-zinc-300 rounded-[100px] w-[52px]" />

          <div className="flex flex-col gap-3 items-start w-full pb-20">
            <div className="text-base font-bold text-zinc-900 max-sm:text-sm">내 주변 비니봇</div>

            <RobotList robots={dummyRobots} />
          </div>
        </div>
      </div>

      <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}


