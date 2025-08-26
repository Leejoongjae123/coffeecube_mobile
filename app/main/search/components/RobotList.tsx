"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RobotData, RobotStatus } from "../types";

interface RobotListProps {
  robots: RobotData[];
}

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

export default function RobotList({ robots }: RobotListProps) {
  return (
    <div className="flex flex-col gap-3 items-start w-full">
      {robots.map((robot) => (
        <div
          key={robot.id}
          className="flex flex-col gap-4 justify-center items-start px-4 py-5 w-full rounded-lg border-gray-200 border-solid bg-zinc-50 border-[1.4px] max-sm:px-3 max-sm:py-4"
        >
          <div className="flex flex-col gap-3 items-start w-full">
            <div className="flex flex-col gap-2 items-start w-full">
              <div className="flex justify-between items-center w-full">
                <Badge className={getStatusBadgeStyle(robot.status)}>{robot.status}</Badge>
                <div className="text-xs text-center text-zinc-600 max-sm:text-xs">{robot.installDate} 설치</div>
              </div>
              <div className="text-base text-zinc-900 max-sm:text-sm">{robot.address}</div>
            </div>
            <div className="text-xs leading-5 text-stone-500 max-sm:text-xs max-sm:leading-5">
              <span>코드 : {robot.code}</span>
              <br />
              <span>현재 수거량 : {robot.currentCollection}</span>
              <br />
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
  );
}


