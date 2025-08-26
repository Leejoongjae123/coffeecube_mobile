"use client";

// 더미 데이터
const pointHistory = [
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

// 누적 포인트 계산 함수
const calculateCumulativePoints = () => {
  let cumulative = 0;
  return pointHistory.map((point) => {
    cumulative += point.earned - point.used;
    return {
      ...point,
      total: cumulative,
    };
  });
};

const pointHistoryWithTotal = calculateCumulativePoints();

export default function PointPage() {
  return (
    <div className="flex relative flex-col items-start pb-9 bg-white h-full min-h-screen">
      {/* Header */}
      <div className="box-border flex gap-2.5 items-center px-5 py-5 h-[60px] w-full">
        <div className="w-full text-lg text-center text-neutral-700">
          포인트 조회
        </div>
      </div>

      {/* Content */}
      <div className="box-border flex flex-col gap-5 items-start p-5 w-full flex-1">
        <div className="flex flex-col items-start w-full">
          {/* Table Header */}
          <div className="box-border flex justify-between items-center px-2 py-0 w-full rounded bg-zinc-100">
            <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
              <div className="text-xs font-bold text-center text-neutral-600">
                일자
              </div>
            </div>
            <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
              <div className="text-xs font-bold text-center text-neutral-600">
                취득
              </div>
            </div>
            <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
              <div className="text-xs font-bold text-center text-neutral-600">
                차감
              </div>
            </div>
            <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
              <div className="text-xs font-bold text-center text-neutral-600">
                합계
              </div>
            </div>
          </div>

          {/* Table Rows */}
          {pointHistoryWithTotal.map((point, index) => (
            <div key={index} className="box-border flex justify-between items-center px-2 py-0 w-full rounded">
              <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
                <div className="text-xs text-center text-stone-500">
                  {point.date}
                </div>
              </div>
              <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
                <div className="text-xs text-center text-stone-500">
                  {point.earned > 0 ? point.earned : '-'}
                </div>
              </div>
              <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
                <div className="text-xs text-center text-stone-500">
                  {point.used > 0 ? point.used : '-'}
                </div>
              </div>
              <div className="flex gap-2.5 justify-center items-center px-2.5 py-4 flex-1">
                <div className="text-xs font-bold text-center text-primary">
                  {point.total.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
