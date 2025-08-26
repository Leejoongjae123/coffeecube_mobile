"use client";
import * as React from "react";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 더미 카드 데이터 타입
interface SearchResult {
  id: string;
  code: string;
  status: "수거 대상" | "장애 발생" | "정상";
  address: string;
  installDate: string;
  currentCollection: string;
  lastCollection: string;
}

// 더미 검색 결과 데이터
const dummySearchResults: SearchResult[] = [
  {
    id: "robot-001",
    code: "asdfghjkl001",
    status: "수거 대상",
    address: "경기도 시흥시 시청로 20 (장현동)",
    installDate: "2025-01-01",
    currentCollection: "75%",
    lastCollection: "2025-01-01-10:30:00"
  },
  {
    id: "robot-002", 
    code: "qwertyui002",
    status: "장애 발생",
    address: "경기도 시흥시 정왕대로 53 (정왕동)",
    installDate: "2024-12-15",
    currentCollection: "12%",
    lastCollection: "2024-12-30-14:20:00"
  },
  {
    id: "robot-003",
    code: "zxcvbnm003",
    status: "수거 대상",
    address: "경기도 시흥시 은행로 47 (신천동)",
    installDate: "2024-11-20",
    currentCollection: "85%",
    lastCollection: "2025-01-01-08:15:00"
  },
  
];

// 상태에 따른 배지 스타일 함수
const getStatusBadgeStyle = (status: SearchResult["status"]) => {
  switch (status) {
    case "수거 대상":
      return "px-2 py-1.5 bg-sky-200 text-sky-600 text-xs font-bold rounded-[100px]";
    case "장애 발생":
      return "px-2 py-1.5 bg-red-100 text-rose-600 text-xs font-bold rounded-[100px]";
    default:
      return "px-2 py-1.5 bg-green-100 text-green-600 text-xs font-bold rounded-[100px]";
  }
};

function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [activeTab, setActiveTab] = React.useState<"address" | "code">("address");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showResults, setShowResults] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-50 h-screen w-full">
      <div className="box-border flex flex-col gap-5 items-end self-stretch p-5 bg-stone-50 h-full w-full ">
        <div className="flex relative justify-between items-start self-stretch">
          <div className="flex relative gap-2.5 items-center">
            <button
              onClick={() => setActiveTab("address")}
              className={`flex relative gap-2.5 justify-center items-center px-2 py-1.5 w-20 rounded-[100px] ${
                activeTab === "address"
                  ? "bg-green-600"
                  : "bg-neutral-200"
              }`}
            >
              <div className={`text-xs font-bold ${
                activeTab === "address" ? "text-white" : "text-stone-500"
              }`}>
                주소로 검색
              </div>
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`flex relative gap-2.5 justify-center items-center px-2 py-1.5 w-20 rounded-[100px] ${
                activeTab === "code"
                  ? "bg-green-600"
                  : "bg-neutral-200"
              }`}
            >
              <div className={`text-xs font-bold ${
                activeTab === "code" ? "text-white" : "text-stone-500"
              }`}>
                코드로 검색
              </div>
            </button>
          </div>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="flex relative flex-col gap-5 items-center w-full px-[18px] border-b border-solid border-b-neutral-300 h-[42px] ">
          <div className="flex relative justify-between items-center self-stretch">
            <div className="flex-1 mr-3">
              <Input
                type="text"
                placeholder={activeTab === "address" ? "검색 조건을 입력해주세요" : "코드를 입력해주세요"}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(e.target.value.length > 0);
                }}
                className="border-0 shadow-none text-sm font-bold text-sky-500 placeholder:text-sky-400 focus-visible:ring-0 px-0"
              />
            </div>
            <Search className="w-[18px] h-[18px] text-green-600 stroke-2" />
          </div>
        </div>
        
        <div className="flex relative flex-col gap-5 items-start self-stretch gap-y-5">
          {showResults ? (
            <>
              <div className="relative self-stretch text-sm font-bold text-neutral-700 max-sm:text-xs">
                검색 결과
              </div>
              
              <div className="flex flex-col gap-3 items-start w-full h-full">
                {dummySearchResults.map((result) => (
                  <div 
                    key={result.id} 
                    className="flex flex-col gap-4 justify-center items-start px-4 py-5 w-full rounded-lg border-gray-200 border-solid bg-zinc-50 border-[1.4px]"
                  >
                    <div className="flex flex-col gap-3 items-start w-full">
                      <div className="flex flex-col gap-2 items-start w-full">
                        <div className="flex justify-between items-center w-full">
                          <Badge className={getStatusBadgeStyle(result.status)}>
                            {result.status}
                          </Badge>
                          <div className="text-xs text-center text-zinc-600">
                            {result.installDate} 설치
                          </div>
                        </div>
                        <div className="text-base text-zinc-900 max-sm:text-sm">
                          {result.address}
                        </div>
                      </div>
                      <div className="text-xs leading-5 text-stone-500 max-sm:text-xs max-sm:leading-5">
                        <span>코드 : {result.code}</span><br />
                        <span>현재 수거량 : {result.currentCollection}</span><br />
                        <span>마지막 수거 : {result.lastCollection}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="relative self-stretch text-sm font-bold text-neutral-700 max-sm:text-xs">
                이전 검색어
              </div>
              
              <div className="flex relative justify-between items-center self-stretch">
                <div className="flex relative gap-2 items-center">
                  <div className="flex relative gap-2.5 justify-center items-center px-2 py-1.5 bg-green-600 rounded-[100px]">
                    <div className="relative text-xs font-bold text-center text-white">
                      주소
                    </div>
                  </div>
                  <div className="relative text-base text-neutral-700 max-sm:text-sm">
                    경기도 시흥시 시청로 20 (장현동)
                  </div>
                </div>
                <div className="relative text-xs text-center text-zinc-600">
                  2025.08.21
                </div>
              </div>
              
              <div className="flex relative justify-between items-center self-stretch">
                <div className="flex relative gap-2 items-center">
                  <div className="flex relative gap-2.5 justify-center items-center px-2 py-1.5 bg-green-600 rounded-[100px]">
                    <div className="relative text-xs font-bold text-center text-white">
                      주소
                    </div>
                  </div>
                  <div className="relative text-base text-neutral-700 max-sm:text-sm">
                    경기도 시흥시 시청로 20 (장현동)
                  </div>
                </div>
                <div className="relative text-xs text-center text-zinc-600">
                  2025.08.21
                </div>
              </div>
              
              <div className="flex relative justify-between items-center self-stretch">
                <div className="flex relative gap-2 items-center">
                  <div className="flex relative gap-2.5 justify-center items-center px-2 py-1.5 bg-white border border-green-600 border-solid rounded-[100px]">
                    <div className="relative text-xs font-bold text-center text-green-600">
                      코드
                    </div>
                  </div>
                  <div className="relative text-base text-neutral-700 max-sm:text-sm">
                    asdfghjkl001
                  </div>
                </div>
                <div className="relative text-xs text-center text-zinc-600">
                  2025.08.21
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
