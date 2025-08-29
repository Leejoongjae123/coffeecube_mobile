"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
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
  const [bottomSheetHeight, setBottomSheetHeight] = useState(300); // 초기 높이를 줄임
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(500); // 기본값
  const [windowHeight, setWindowHeight] = useState(800); // 기본값
  const bottomSheetRef = useRef<HTMLDivElement>(null);

  const minHeight = 120; // 최소 높이를 줄임 (핸들과 타이틀만 보이도록)
  const bottomNavbarHeight = 80; // Bottom Navbar 높이 (pb-20 = 80px)
  
  // windowHeight와 maxHeight 업데이트
  React.useEffect(() => {
    const updateWindowHeight = () => {
      setWindowHeight(window.innerHeight);
    };
    
    updateWindowHeight();
    window.addEventListener('resize', updateWindowHeight);
    
    return () => window.removeEventListener('resize', updateWindowHeight);
  }, []);
  
  // maxHeight 계산을 windowHeight에 따라 업데이트 (Bottom Navbar 높이 고려)
  React.useEffect(() => {
    const availableHeight = windowHeight - bottomNavbarHeight;
    setMaxHeight(availableHeight * 0.85); // 최대 높이를 화면의 85%로 제한
  }, [windowHeight]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartHeight(bottomSheetHeight);
  }, [bottomSheetHeight]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartHeight(bottomSheetHeight);
  }, [bottomSheetHeight]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) {
      return;
    }
    
    const deltaY = startY - e.clientY;
    const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
    setBottomSheetHeight(newHeight);
  }, [isDragging, startY, startHeight, minHeight, maxHeight]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) {
      return;
    }
    
    e.preventDefault();
    const deltaY = startY - e.touches[0].clientY;
    const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
    setBottomSheetHeight(newHeight);
  }, [isDragging, startY, startHeight, minHeight, maxHeight]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    
    // 개선된 스냅 포인트 기능 - 3단계로 설정
    const snapPoints = [
      minHeight, // 최소 (핸들과 타이틀만)
      maxHeight * 0.5, // 중간 (리스트 일부 표시)
      maxHeight // 최대 (전체 리스트)
    ];
    
    let closestSnap = snapPoints[0];
    let minDistance = Math.abs(bottomSheetHeight - snapPoints[0]);
    
    snapPoints.forEach(point => {
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
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  // 상단 MapArea 높이를 바텀 시트 높이에 따라 동적으로 계산
  const containerHeight = windowHeight - bottomNavbarHeight;

  return (
    <div 
      className="relative bg-white w-full overflow-hidden"
      style={{ height: `${containerHeight}px` }}
    >
      {/* 전체 화면을 차지하는 MapArea */}
      <div className="absolute inset-0 w-full h-full">
        <MapArea />
      </div>

      {/* 검색 버튼은 MapArea 위에 고정 */}
      <div className="absolute top-0 left-0 w-full z-10">
        <SearchInputButton onOpen={() => setIsModalOpen(true)} />
      </div>

      {/* 내 위치 버튼 */}
      <div 
        className={`absolute right-0 flex gap-2.5 justify-end items-center px-5 py-3 w-full z-20 ${isDragging ? '' : 'transition-all duration-200 ease-out'}`}
        style={{ bottom: `${bottomSheetHeight + 10}px` }}
      >
        <button className="flex items-center justify-center w-[40px] h-[40px] bg-gray-50 rounded-lg border border-gray-300 shadow-lg">
          <Image src="/mypoint.svg" width={16} height={16} alt="mypoint" />
        </button>
      </div>

      {/* 드래그 가능한 Bottom Sheet */}
      <div 
        ref={bottomSheetRef}
        className={`absolute bottom-0 left-0 flex flex-col w-full bg-white shadow-lg shadow-gray-500/20 rounded-[20px_20px_0_0] overflow-hidden ${isDragging ? '' : 'transition-all duration-300 ease-out'}`}
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
          <div className="text-base font-bold text-zinc-900 max-sm:text-sm mb-3">내 주변 비니봇</div>
          <RobotList robots={dummyRobots} />
        </div>
      </div>

      <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}


