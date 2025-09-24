"use client";

import { useState, useEffect } from "react";
import ToggleTabs from "@/app/main/status/components/ToggleTabs";
import StatusTable from "@/app/main/status/components/StatusTable";
import { TabKey, StatusRow, StatusApiResponse } from "../types";

export default function StatusClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("daily");
  const [data, setData] = useState<StatusRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // 데이터 가져오기 함수
  const fetchData = async (type: TabKey) => {
    try {
      setIsLoading(true);
      setError("");

      const endpoint =
        type === "daily" ? "/api/status/daily" : "/api/status/monthly";
      const response = await fetch(endpoint);
      const result: StatusApiResponse = await response.json();

      if (!response.ok) {
        setError(result.error || "데이터를 가져오는 중 오류가 발생했습니다.");
        return;
      }

      setData(result.data);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 탭 변경 시 데이터 다시 가져오기
  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  // 탭 변경 핸들러
  const handleTabChange = (newTab: TabKey) => {
    setActiveTab(newTab);
  };

  return (
    <div className="min-h-screen text-center bg-white w-full">
      <div className="flex px-5 py-4 text-lg font-medium text-neutral-700 h-[60px] sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="self-stretch my-auto text-neutral-700 w-full">
          커피박 수거량 조회
        </div>
      </div>

      <div className="flex flex-col p-5 w-full text-xs overflow-y-auto">
        <ToggleTabs active={activeTab} onChange={handleTabChange} />

        {error ? (
          <div className="flex items-center justify-center h-40 text-red-500">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-40 text-gray-500">
            로딩 중...
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-500">
            수거량 데이터가 없습니다.
          </div>
        ) : (
          <StatusTable rows={data} />
        )}
      </div>
    </div>
  );
}
