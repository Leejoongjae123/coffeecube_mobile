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

    // 일별 수거량 데이터 조회 (최근 30일)
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
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
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

    // 일별로 그룹화하고 포인트 계산 (1kg = 50 포인트)
    const dailyData =
      (inputRecords as unknown as InputRecord[])?.map((record) => ({
        date: new Date(record.input_date)
          .toLocaleDateString("ko-KR", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
          })
          .replace(/\. /g, "-")
          .replace(".", ""),
        location: `${record.equipment_list.region_si} ${
          record.equipment_list.region_dong || ""
        } ${record.equipment_list.install_location}`.trim(),
        amount: Number(record.input_amount).toFixed(1),
        points: Math.round(Number(record.input_amount) * 50).toString(),
      })) || [];

    return NextResponse.json({
      success: true,
      data: dailyData,
    });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
