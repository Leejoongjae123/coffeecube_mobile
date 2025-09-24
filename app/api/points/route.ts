import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 포인트 정보 타입 정의
interface PointData {
  date: string;
  earned: number;
  used: number;
  id: string;
  user_id: string;
  points: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // 현재 로그인한 사용자 정보 가져오기
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { data: [], error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // user_points 테이블에서 해당 사용자의 포인트 내역 조회
    const { data: pointsData, error: pointsError } = await supabase
      .from("user_points")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (pointsError) {
      return NextResponse.json(
        { data: [], error: "포인트 데이터를 가져오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 날짜별로 그룹화하여 earned/used 값을 분리
    const groupedByDate =
      pointsData?.reduce((acc, point) => {
        const date = new Date(point.created_at)
          .toLocaleDateString("ko-KR", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
          })
          .replace(/\./g, "-")
          .replace(/\s/g, "");

        if (!acc[date]) {
          acc[date] = {
            date,
            earned: 0,
            used: 0,
            id: point.id,
            user_id: point.user_id,
            points: 0,
            transaction_type: point.transaction_type,
            description: point.description,
            created_at: point.created_at,
          };
        }

        if (point.transaction_type === "earned") {
          acc[date].earned += point.points;
        } else if (point.transaction_type === "used") {
          acc[date].used += point.points;
        }

        acc[date].points = acc[date].earned - acc[date].used;

        return acc;
      }, {} as Record<string, PointData>) || {};

    // 객체를 배열로 변환하고 날짜순 정렬
    const formattedData = (Object.values(groupedByDate) as PointData[]).sort(
      (a: PointData, b: PointData) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      data: formattedData,
      error: null,
    });
  } catch {
    return NextResponse.json(
      { data: [], error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
