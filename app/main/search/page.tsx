"use client";

import { Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { RobotData, RobotStatus } from "./types";
import SearchModal from "@/components/SearchModal";
import { useState } from "react";

// 더미 데이터
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
    longitude: 126.9780
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
    longitude: 126.7417
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
    longitude: 126.8029
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
    longitude: 126.7982
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
    longitude: 126.8343
  }
];

// 상태에 따른 배지 스타일 함수
const getStatusBadgeStyle = (status: RobotStatus) => {
  switch (status) {
    case "수거 대상":
      return "px-2 py-1.5 bg-sky-200 text-sky-600 text-xs font-bold rounded-[100px] max-sm:px-1.5 max-sm:py-1";
    case "장애 발생":
      return "px-2 py-1.5 bg-red-100 text-rose-600 text-xs font-bold rounded-[100px] max-sm:px-1.5 max-sm:py-1";
    default:
      return "px-2 py-1.5 bg-green-100 text-green-600 text-xs font-bold rounded-[100px] max-sm:px-1.5 max-sm:py-1";
  }
};

export default function SearchPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative bg-white h-screen w-full overflow-y-auto">
      {/* Map Area */}
      <div className="absolute top-0 rounded-lg h-[401px] left-[-35px] w-[430px] max-md:left-0 max-md:w-full max-md:h-[300px] max-sm:h-[250px]">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/2a940d1891c9eb3c0c8b4fde16349db22b7e0270?width=853"
          alt=""
          className="h-[400px] object-cover"
        />
        
        {/* My Location Badge */}
        <div className="inline-flex absolute gap-2.5 justify-center items-center px-3 py-0.5 bg-neutral-950 bg-opacity-60 h-[22px] left-[275px] rounded-[100px] top-[100px] w-[52px]">
          <div className="text-xs font-bold tracking-normal leading-5 text-center text-white">
            내 위치
          </div>
        </div>
        
        {/* My Location Pin */}
        <div className="absolute left-[285px] top-[126px]">
          <svg width="12" height="26" viewBox="0 0 12 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.666667 19.8078C0.666667 22.7533 3.05448 25.1411 6 25.1411C8.94552 25.1411 11.3333 22.7533 11.3333 19.8078C11.3333 16.8623 8.94552 14.4744 6 14.4744C3.05448 14.4744 0.666667 16.8623 0.666667 19.8078ZM6 0H5V19.8078H6H7V0H6Z" fill="#282828"/>
          </svg>
        </div>
        
        {/* Blue Robot Marker */}
        <div className="absolute w-5 h-5 bg-sky-500 bg-opacity-30 left-[84px] rounded-[100px] top-[198px]">
          <div className="inline-flex absolute flex-col items-center h-11 left-[-37px] top-[-34px] w-[94px]">
            <div className="flex gap-2.5 justify-center items-center px-3 py-0.5 bg-sky-500 rounded-[100px]">
              <div className="text-xs leading-5 text-center text-white">
                asdfghjkl001
              </div>
            </div>
            <div className="mt-1">
              <svg width="12" height="26" viewBox="0 0 12 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.666667 20C0.666667 22.9455 3.05448 25.3334 6 25.3334C8.94552 25.3334 11.3333 22.9455 11.3333 20C11.3333 17.0545 8.94552 14.6667 6 14.6667C3.05448 14.6667 0.666667 17.0545 0.666667 20ZM6 0.192261H5V20H6H7V0.192261H6Z" fill="#0E8FEB"/>
              </svg>
            </div>
          </div>
          <div className="absolute left-1 top-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="6" r="6" fill="#006DFB"/>
            </svg>
          </div>
        </div>
        
        {/* Green Marker */}
        <div className="absolute left-[200px] top-[250px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="20" rx="10" fill="#00A70B" fillOpacity="0.3"/>
            <circle cx="10" cy="10" r="6" fill="#26A12E"/>
          </svg>
        </div>
        
        {/* Red Marker */}
        <div className="absolute left-[150px] top-[180px]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="20" rx="10" fill="#DE1443" fillOpacity="0.3"/>
            <circle cx="10" cy="10" r="6" fill="#DE1443"/>
          </svg>
        </div>
      </div>
      
      {/* Search Input */}
      <div className="absolute left-5 z-10 top-[23px] max-md:inset-x-5 max-md:w-auto max-sm:inset-x-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col gap-5 items-start px-5 py-3 border border-solid shadow-sm bg-stone-50 border-stone-300 h-[42px] rounded-[100px] w-[316px] max-md:w-full max-sm:px-4 max-sm:py-2.5 max-sm:h-10"
        >
          <div className="flex justify-between items-center w-full">
            <div className="text-sm font-semibold text-neutral-400 max-sm:text-xs">
              주소를 입력해주세요
            </div>
            <Search className="w-[18px] h-[18px] text-blue-500 stroke-2" />
          </div>
        </button>
      </div>
      
      {/* Main Content Area */}
      <div className="flex absolute left-0 flex-col gap-3 items-end h-[calc(100vh-229px)] top-[229px] w-full max-md:h-auto max-md:min-h-[500px]">
        {/* Target Button */}
        <div className="flex gap-2.5 justify-end items-center px-5 py-0 w-full">
          <button className="flex items-center justify-center w-[40px] h-[40px] bg-gray-50 rounded-lg border border-gray-300 shadow-lg">
            <Image src="/mypoint.svg" width={16} height={16} alt="mypoint"></Image>
          </button>
        </div>
        
        {/* Bottom Sheet */}
        <div className="flex flex-col gap-8 items-center px-6 py-3 w-full bg-white shadow-lg shadow-gray-500/10 flex-1 rounded-[20px_20px_0_0] gap-y-6 overflow-y-auto">
          {/* Handle */}
          <div className="h-1.5 bg-zinc-300 rounded-[100px] w-[52px]" />
          
          {/* Content */}
          <div className="flex flex-col gap-3 items-start w-full pb-20">
            <div className="text-base font-bold text-zinc-900 max-sm:text-sm">
              내 주변 비니봇
            </div>
            
            <div className="flex flex-col gap-3 items-start w-full">
              {dummyRobots.map((robot) => (
                <div 
                  key={robot.id} 
                  className="flex flex-col gap-4 justify-center items-start px-4 py-5 w-full rounded-lg border-gray-200 border-solid bg-zinc-50 border-[1.4px] max-sm:px-3 max-sm:py-4"
                >
                  <div className="flex flex-col gap-3 items-start w-full">
                    <div className="flex flex-col gap-2 items-start w-full">
                      <div className="flex justify-between items-center w-full">
                        <Badge className={getStatusBadgeStyle(robot.status)}>
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
                      <span>코드 : {robot.code}</span><br />
                      <span>현재 수거량 : {robot.currentCollection}</span><br />
                      <span>마지막 수거 : {robot.lastCollection}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 h-[56px] flex items-center justify-center gap-2">
                    <Image src="/pin.svg" width={24} height={24} alt="pin" />
                    도착지로 설정
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
