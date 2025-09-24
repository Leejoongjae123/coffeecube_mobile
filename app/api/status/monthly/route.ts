import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase 조인 데이터 타입 정의
interface EquipmentInfo {
  install_location: string;
  region_si: string;
  region_dong: string | null;
}

interface InputRecord {
  input_amount: number;
  input_date: string;
  robot_code: string;
  equipment_list: EquipmentInfo;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // 현재 사용자 정보 가져오기
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 월별 수거량 데이터 조회 (최근 12개월)
    const { data: inputRecords, error } = await supabase
      .from("input_records")
      .select(
        `
        input_amount,
        input_date,
        robot_code,
        equipment_list!inner(
          install_location,
          region_si,
          region_dong
        )
      `
      )
      .eq("user_id", user.id)
      .eq("input_type", "coffee_bean")
      .gte(
        "input_date",
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      )
      .order("input_date", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "데이터를 가져오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 월별로 그룹화
    const monthlyGroups: {
      [key: string]: { amount: number; locations: Set<string>; points: number };
    } = {};

    (inputRecords as unknown as InputRecord[])?.forEach((record) => {
      const date = new Date(record.input_date);
      const monthKey = `${date.getFullYear().toString().slice(-2)}-${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;
      const location = `${record.equipment_list.region_si} ${record.equipment_list.install_location}`;

      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = {
          amount: 0,
          locations: new Set(),
          points: 0,
        };
      }

      monthlyGroups[monthKey].amount += Number(record.input_amount);
      monthlyGroups[monthKey].locations.add(location);
      monthlyGroups[monthKey].points += Math.round(
        Number(record.input_amount) * 50
      );
    });

    // 월별 데이터 포맷팅
    const monthlyData = Object.entries(monthlyGroups)
      .map(([month, data]) => ({
        date: month,
        location: `${Array.from(data.locations).slice(0, 3).join(", ")}${
          data.locations.size > 3 ? ` 외 ${data.locations.size - 3}곳` : ""
        } (총 ${data.locations.size}곳)`,
        amount: data.amount.toFixed(1),
        points: data.points.toLocaleString(),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({
      success: true,
      data: monthlyData,
    });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
