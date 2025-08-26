"use client";

import PointHeader from "./PointHeader";
import PointTable from "./PointTable";
import { PointRecord } from "../types";

const pointHistory: PointRecord[] = [
  { date: "25-01-15", earned: 500, used: 0 },
  { date: "25-01-10", earned: 0, used: 200 },
  { date: "25-01-08", earned: 300, used: 0 },
  { date: "25-01-05", earned: 0, used: 150 },
  { date: "25-01-03", earned: 750, used: 0 },
  { date: "24-12-28", earned: 0, used: 300 },
  { date: "24-12-25", earned: 1000, used: 0 },
  { date: "24-12-20", earned: 0, used: 100 },
  { date: "24-12-18", earned: 400, used: 0 },
  { date: "24-12-15", earned: 0, used: 250 },
  { date: "24-12-10", earned: 600, used: 0 },
];

function calculateCumulativePoints(records: PointRecord[]) {
  let cumulative = 0;
  return records.map((point) => {
    cumulative += point.earned - point.used;
    return { ...point, total: cumulative };
  });
}

export default function PointClient() {
  const dataWithTotal = calculateCumulativePoints(pointHistory);

  return (
    <div className="flex relative flex-col items-start pb-9 bg-white h-full min-h-screen">
      <PointHeader />
      <div className="box-border flex flex-col gap-5 items-start p-5 w-full flex-1">
        <PointTable rows={dataWithTotal} />
      </div>
    </div>
  );
}


