"use client";

import { PointRow } from "@/app/main/point/types";

interface PointTableProps {
  rows: PointRow[];
}

export default function PointTable({ rows }: PointTableProps) {
  return (
    <div className="flex flex-col items-start w-full">
      <div className="box-border flex justify-between items-center px-2 py-0 w-full rounded bg-zinc-100">
        <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
          <div className="text-xs font-bold text-center text-neutral-600">일자</div>
        </div>
        <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
          <div className="text-xs font-bold text-center text-neutral-600">취득</div>
        </div>
        <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
          <div className="text-xs font-bold text-center text-neutral-600">차감</div>
        </div>
        <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
          <div className="text-xs font-bold text-center text-neutral-600">합계</div>
        </div>
      </div>

      {rows.map((point, index) => (
        <div key={index} className="box-border flex justify-between items-center px-2 py-0 w-full rounded">
          <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
            <div className="text-xs text-center text-stone-500">{point.date}</div>
          </div>
          <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
            <div className="text-xs text-center text-stone-500">{point.earned > 0 ? point.earned : '-'}</div>
          </div>
          <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
            <div className="text-xs text-center text-stone-500">{point.used > 0 ? point.used : '-'}</div>
          </div>
          <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
            <div className="text-xs font-bold text-center text-primary">{point.total?.toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}


