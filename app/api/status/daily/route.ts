import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase 데이터 타입 정의
interface EquipmentInfo {
  install_location: string;
  region_si: string;
  region_dong: string | null;
}

interface InputRecord {
  id: string;
  input_amount: number;
  input_date: string;
  robot_code: string;
  equipment_list: EquipmentInfo;
}

interface InputRecordWithPoints extends InputRecord {
  points_earned: number;
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
    const { data: inputRecords, error: inputError } = await supabase
      .from("input_records")
      .select(
        `
        id,
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
      .gte(
        "input_date",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      )
      .order("input_date", { ascending: false });

    if (inputError) {
      return NextResponse.json(
        { error: "입력 기록 데이터를 가져오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // input_records ID 목록 추출
    const inputRecordIds = inputRecords?.map((record) => record.id) || [];

    // 해당 input_records에 대응하는 user_points 조회
    const { data: userPoints, error: pointsError } = await supabase
      .from("user_points")
      .select("id, points_earned, source_reference_id")
      .in("source_reference_id", inputRecordIds);

    if (pointsError) {
      return NextResponse.json(
        { error: "포인트 데이터를 가져오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // input_records와 user_points를 manual JOIN
    const recordsWithPoints: InputRecordWithPoints[] =
      (inputRecords as unknown as InputRecord[])?.map((record) => {
        const pointData = userPoints?.find(
          (point) => point.source_reference_id === record.id
        );
        return {
          ...record,
          points_earned: pointData?.points_earned || 0,
        };
      }) || [];

    // 일별로 그룹화하고 실제 포인트 값 사용
    const dailyData = recordsWithPoints.map((record) => ({
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
      points: record.points_earned.toString(),
    }));

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
