"use client";

import { useEffect, useState } from "react";
import PointHeader from "./PointHeader";
import PointTable from "./PointTable";
import { PointRecord, PointApiResponse } from "../types";

function calculateCumulativePoints(records: PointRecord[]) {
  let cumulative = 0;
  return records.map((point) => {
    cumulative += point.earned - point.used;
    return { ...point, total: cumulative };
  });
}

export default function PointClient() {
  const [pointHistory, setPointHistory] = useState<PointRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPointHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/points");
        const result: PointApiResponse = await response.json();

        if (result.error) {
          setError(result.error);
        } else {
          setPointHistory(result.data);
        }
      } catch {
        setError("포인트 내역을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPointHistory();
  }, []);

  const dataWithTotal = calculateCumulativePoints(pointHistory);

  if (loading) {
    return (
      <div className="flex relative flex-col items-start pb-9 bg-white h-full min-h-screen">
        <PointHeader />
        <div className="box-border flex flex-col gap-5 items-center justify-center p-5 w-full flex-1">
          <div className="text-center text-gray-500">
            포인트 내역을 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex relative flex-col items-start pb-9 bg-white h-full min-h-screen">
        <PointHeader />
        <div className="box-border flex flex-col gap-5 items-center justify-center p-5 w-full flex-1">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex relative flex-col items-start pb-9 bg-white h-full min-h-screen">
      <PointHeader />
      <div className="box-border flex flex-col gap-5 items-start p-5 w-full flex-1">
        {dataWithTotal.length === 0 ? (
          <div className="flex items-center justify-center w-full py-10">
            <div className="text-center text-gray-500">
              포인트 내역이 없습니다.
            </div>
          </div>
        ) : (
          <PointTable rows={dataWithTotal} />
        )}
      </div>
    </div>
  );
}
