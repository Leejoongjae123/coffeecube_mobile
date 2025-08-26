"use client";

import { StatusRow } from "../types";

interface StatusTableProps {
  rows: StatusRow[];
}

export default function StatusTable({ rows }: StatusTableProps) {
  return (
    <div className="mt-5 w-full font-medium text-stone-500 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="flex justify-between items-center px-2 w-full font-bold whitespace-nowrap rounded bg-zinc-100 text-neutral-600 sticky top-0 z-10">
        <div className="flex gap-2.5 justify-center items-center self-stretch py-4 pr-2.5 pl-2.5 my-auto w-10">
          <div className="self-stretch my-auto">일자</div>
        </div>
        <div className="flex flex-1 shrink gap-2.5 justify-center items-center self-stretch px-2.5 py-4 my-auto basis-0">
          <div className="self-stretch my-auto">수거장소</div>
        </div>
        <div className="flex gap-2.5 justify-center items-center self-stretch px-1 py-4 my-auto w-10">
          <div className="self-stretch my-auto">수거량</div>
        </div>
        <div className="flex gap-2.5 justify-center items-center self-stretch px-1 py-4 my-auto w-10">
          <div className="self-stretch my-auto">포인트</div>
        </div>
      </div>

      {rows.map((item, index) => (
        <div key={index} className="flex justify-between items-center px-2 w-full rounded border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="flex gap-2.5 justify-center items-center self-stretch py-4 my-auto w-10">
            <div className="self-stretch my-auto truncate">{item.date}</div>
          </div>
          <div className="flex flex-1 shrink gap-2.5 justify-center items-center self-stretch px-2.5 py-4 my-auto basis-0 min-w-0">
            <div className="self-stretch my-auto truncate">{item.location}</div>
          </div>
          <div className="flex gap-2.5 justify-center items-center self-stretch px-2.5 py-4 my-auto w-10 whitespace-nowrap">
            <div className="self-stretch my-auto font-bold text-green-600">{item.amount}</div>
          </div>
          <div className="flex gap-2.5 justify-center items-center self-stretch px-2.5 py-4 my-auto w-10 whitespace-nowrap">
            <div className="self-stretch my-auto">{item.points}</div>
          </div>
        </div>
      ))}
    </div>
  );
}


