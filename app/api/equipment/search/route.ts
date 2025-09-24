import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("query");
  const type = searchParams.get("type"); // 'address' 또는 'code'

  if (!query) {
    return NextResponse.json(
      { error: "검색어를 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    let searchResults;

    if (type === "address") {
      // 주소로 검색 - install_location, region_si, region_dong에서 검색
      const { data, error } = await supabase
        .from("equipment_list")
        .select("*")
        .or(
          `install_location.ilike.%${query}%,region_si.ilike.%${query}%,region_dong.ilike.%${query}%`
        )
        .eq("usable", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Database error:", error);
        return NextResponse.json(
          { error: "검색 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }

      searchResults = data;
    } else if (type === "code") {
      // 코드로 검색
      const { data, error } = await supabase
        .from("equipment_list")
        .select("*")
        .ilike("robot_code", `%${query}%`)
        .eq("usable", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Database error:", error);
        return NextResponse.json(
          { error: "검색 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }

      searchResults = data;
    } else {
      return NextResponse.json(
        { error: "잘못된 검색 타입입니다." },
        { status: 400 }
      );
    }

    // 검색 결과가 없으면 빈 배열 반환
    if (!searchResults || searchResults.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
      });
    }

    // 검색된 장비들의 robot_code 리스트
    const robotCodes = searchResults.map(
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
    const equipmentWithStatus = searchResults.map((equipment: Equipment) => {
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
