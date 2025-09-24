import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Equipment {
  id: string;
  robot_code: string;
  name: string;
  install_location: string;
  install_location_raw?: string; // geocode에 사용할 원본 주소
  region_si: string;
  region_dong: string;
  coordinates_x: string;
  coordinates_y: string;
  created_at: string;
  usable: boolean;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // equipment_list에서 장비 목록 가져오기
    const { data: equipmentList, error } = await supabase
      .from("equipment_list")
      .select("*")
      .eq("usable", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Database error:", error);
      return NextResponse.json(
        { error: "장비 목록을 가져오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 장비 목록이 없으면 빈 배열 반환
    if (!equipmentList || equipmentList.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
      });
    }

    // 모든 장비의 robot_code 리스트
    const robotCodes = equipmentList.map(
      (equipment: Equipment) => equipment.robot_code
    );

    // 한 번에 모든 장비의 최신 상태를 가져오기
    const { data: allStatuses } = await supabase
      .from("equipment_status")
      .select("*")
      .in("robot_code", robotCodes)
      .order("created_at", { ascending: false });

    // 각 robot_code별 최신 상태 찾기
    const latestStatusMap = new Map();
    if (allStatuses) {
      allStatuses.forEach((status) => {
        if (!latestStatusMap.has(status.robot_code)) {
          latestStatusMap.set(status.robot_code, status);
        }
      });
    }

    // 장비 정보와 최신 상태 결합
    const equipmentWithStatus = equipmentList.map((equipment: Equipment) => {
      const latestStatus = latestStatusMap.get(equipment.robot_code);

      return {
        id: equipment.id,
        code: equipment.robot_code,
        name: equipment.name,
        address: equipment.install_location,
        install_location_raw: equipment.install_location_raw, // geocode에 사용할 원본 주소 추가
        region_si: equipment.region_si,
        region_dong: equipment.region_dong,
        coordinates_x: equipment.coordinates_x,
        coordinates_y: equipment.coordinates_y,
        installDate: equipment.created_at?.split("T")[0] || "",
        status: latestStatus?.device_status || "정상",
        currentCollection: latestStatus?.total_weight
          ? `${parseFloat(latestStatus.total_weight).toFixed(1)}kg`
          : "0kg",
        temperature: latestStatus?.temperature
          ? `${parseFloat(latestStatus.temperature).toFixed(1)}°C`
          : "0°C",
        lastCollection: latestStatus?.created_at || equipment.created_at,
        // 좌표가 있으면 임시로 서울 주변 좌표로 변환 (실제로는 좌표 변환 로직 필요)
        latitude: equipment.coordinates_x
          ? 37.5665 + (parseFloat(equipment.coordinates_x) - 166.5) * 0.01
          : 37.5665,
        longitude: equipment.coordinates_y
          ? 126.978 + (parseFloat(equipment.coordinates_y) - 40) * 0.01
          : 126.978,
        usable: equipment.usable,
      };
    });

    return NextResponse.json({
      results: equipmentWithStatus,
      total: equipmentWithStatus.length,
    });
  } catch (error) {
    console.log("Server error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
