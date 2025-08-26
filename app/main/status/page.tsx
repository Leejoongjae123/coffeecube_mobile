"use client";
import React, { useState } from 'react';

export default function StatusPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

  // Daily collection data
  const dailyCollectionData = [
    { date: '24-12-15', location: '서울특별시 강남구 테헤란로 152 (강남동)', amount: '2.5', points: '125' },
    { date: '24-12-14', location: '서울특별시 서초구 서초대로 396 (서초동)', amount: '3.2', points: '160' },
    { date: '24-12-13', location: '경기도 성남시 분당구 정자일로 95 (정자동)', amount: '1.8', points: '90' },
    { date: '24-12-12', location: '서울특별시 송파구 올림픽로 300 (신천동)', amount: '4.1', points: '205' },
    { date: '24-12-11', location: '인천광역시 연수구 컨벤시아대로 165 (송도동)', amount: '2.9', points: '145' },
    { date: '24-12-10', location: '경기도 수원시 영통구 월드컵로 164 (원천동)', amount: '3.7', points: '185' },
    { date: '24-12-09', location: '서울특별시 마포구 월드컵북로 396 (상암동)', amount: '2.1', points: '105' },
    { date: '24-12-08', location: '경기도 시흥시 시청로 20 (장현동)', amount: '5.2', points: '260' },
    { date: '24-12-07', location: '서울특별시 영등포구 여의대로 108 (여의도동)', amount: '3.5', points: '175' },
    { date: '24-12-06', location: '경기도 고양시 일산동구 정발산로 24 (장항동)', amount: '2.3', points: '115' },
    { date: '24-12-05', location: '서울특별시 종로구 세종대로 209 (세종로)', amount: '4.6', points: '230' },
    { date: '24-12-04', location: '부산광역시 해운대구 해운대해변로 264 (우동)', amount: '3.1', points: '155' },
    { date: '24-12-03', location: '대구광역시 수성구 동대구로 123 (범어동)', amount: '2.8', points: '140' },
    { date: '24-12-02', location: '대전광역시 유성구 대학로 291 (궁동)', amount: '3.9', points: '195' },
    { date: '24-12-01', location: '광주광역시 서구 상무중앙로 61 (치평동)', amount: '2.7', points: '135' },
    { date: '24-11-30', location: '울산광역시 남구 삼산로 92 (삼산동)', amount: '4.3', points: '215' },
    { date: '24-11-29', location: '세종특별자치시 한누리대로 2130 (어진동)', amount: '3.4', points: '170' },
    { date: '24-11-28', location: '강원도 춘천시 중앙로 1 (조양동)', amount: '2.6', points: '130' },
    { date: '24-11-27', location: '충청북도 청주시 상당구 상당로 69 (북문로1가)', amount: '3.8', points: '190' },
    { date: '24-11-26', location: '충청남도 천안시 동남구 만남로 43 (신부동)', amount: '2.4', points: '120' },
    { date: '24-11-25', location: '전라북도 전주시 완산구 효자로 225 (효자동)', amount: '4.7', points: '235' },
    { date: '24-11-24', location: '전라남도 목포시 상동 1135-8', amount: '3.3', points: '165' },
    { date: '24-11-23', location: '경상북도 포항시 북구 중앙로 1 (중앙동)', amount: '2.9', points: '145' },
    { date: '24-11-22', location: '경상남도 창원시 의창구 중앙대로 151 (용호동)', amount: '4.0', points: '200' },
    { date: '24-11-21', location: '제주특별자치도 제주시 연동 312-1', amount: '3.6', points: '180' }
  ];

  // Monthly collection data - same format as daily but with different data
  const monthlyCollectionData = [
    { date: '24-12', location: '서울/경기 지역 카페 26곳', amount: '78.4', points: '3,920' },
    { date: '24-11', location: '서울/경기/인천 지역 카페 42곳', amount: '142.6', points: '7,130' },
    { date: '24-10', location: '전국 주요 도시 카페 48곳', amount: '156.8', points: '7,840' },
    { date: '24-09', location: '서울 강남/강북 지역 카페 41곳', amount: '134.2', points: '6,710' },
    { date: '24-08', location: '수도권 및 광역시 카페 52곳', amount: '167.5', points: '8,375' },
    { date: '24-07', location: '전국 프랜차이즈 카페 58곳', amount: '189.3', points: '9,465' },
    { date: '24-06', location: '서울/경기 개인카페 54곳', amount: '175.9', points: '8,795' },
    { date: '24-05', location: '수도권 중심 카페 44곳', amount: '143.7', points: '7,185' },
    { date: '24-04', location: '서울 4대 권역 카페 39곳', amount: '128.4', points: '6,420' },
    { date: '24-03', location: '강남/서초/송파 카페 29곳', amount: '95.6', points: '4,780' },
    { date: '24-02', location: '서울 도심 카페 27곳', amount: '87.2', points: '4,360' },
    { date: '24-01', location: '신규 파트너 카페 31곳', amount: '102.8', points: '5,140' }
  ];

  // Get current data based on active tab
  const currentData = activeTab === 'daily' ? dailyCollectionData : monthlyCollectionData;

  return (
    <div className="min-h-screen text-center bg-white w-full">
      {/* Header */}
      <div className="flex px-5 py-4 text-lg font-medium text-neutral-700 h-[60px] sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="self-stretch my-auto text-neutral-700 w-full">
          커피박 수거량 조회
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col p-5 w-full text-xs overflow-y-auto">
        {/* Toggle Buttons */}
        <div className="flex gap-2.5 items-center self-start font-semibold">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex gap-2.5 justify-center items-center px-2 py-1.5 w-20 rounded-[100px] transition-colors ${
              activeTab === 'daily'
                ? 'text-white bg-green-600'
                : 'bg-neutral-200 text-stone-500'
            }`}
          >
            <div className="self-stretch my-auto">
              일별 수거량
            </div>
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex gap-2.5 justify-center items-center px-2 py-1.5 w-20 rounded-[100px] transition-colors ${
              activeTab === 'monthly'
                ? 'text-white bg-green-600'
                : 'bg-neutral-200 text-stone-500'
            }`}
          >
            <div className="self-stretch my-auto">
              월별 수거량
            </div>
          </button>
        </div>

        {/* Table */}
        <div className="mt-5 w-full font-medium text-stone-500 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Table Header */}
          <div className="flex justify-between items-center px-2 w-full font-bold whitespace-nowrap rounded bg-zinc-100 text-neutral-600 sticky top-0 z-10">
            <div className="flex gap-2.5 justify-center items-center self-stretch py-4 pr-2.5 pl-2.5 my-auto w-10">
              <div className="self-stretch my-auto">
                일자
              </div>
            </div>
            <div className="flex flex-1 shrink gap-2.5 justify-center items-center self-stretch px-2.5 py-4 my-auto basis-0">
              <div className="self-stretch my-auto">
                수거장소
              </div>
            </div>
            <div className="flex gap-2.5 justify-center items-center self-stretch px-1 py-4 my-auto w-10">
              <div className="self-stretch my-auto">
                수거량
              </div>
            </div>
            <div className="flex gap-2.5 justify-center items-center self-stretch px-1 py-4 my-auto w-10">
              <div className="self-stretch my-auto">
                포인트
              </div>
            </div>
          </div>

          {/* Table Rows */}
          {currentData.map((item, index) => (
            <div key={index} className="flex justify-between items-center px-2 w-full rounded border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex gap-2.5 justify-center items-center self-stretch py-4 my-auto w-10">
                <div className="self-stretch my-auto truncate">
                  {item.date}
                </div>
              </div>
              <div className="flex flex-1 shrink gap-2.5 justify-center items-center self-stretch px-2.5 py-4 my-auto basis-0 min-w-0">
                <div className="self-stretch my-auto truncate">
                  {item.location}
                </div>
              </div>
              <div className="flex gap-2.5 justify-center items-center self-stretch px-2.5 py-4 my-auto w-10 whitespace-nowrap">
                <div className="self-stretch my-auto font-bold text-green-600">
                  {item.amount}
                </div>
              </div>
              <div className="flex gap-2.5 justify-center items-center self-stretch px-2.5 py-4 my-auto w-10 whitespace-nowrap">
                <div className="self-stretch my-auto">
                  {item.points}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
