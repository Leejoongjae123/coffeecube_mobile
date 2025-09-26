import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { phone_number } = await request.json();

    if (!phone_number) {
      return NextResponse.json(
        { error: "전화번호는 필수입니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // profiles 테이블에서 phone_no로 사용자 찾기
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("email, register_date")
      .eq("phone_no", phone_number)
      .eq("is_out", false) // 탈퇴하지 않은 사용자만
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // 사용자를 찾을 수 없는 경우
        return NextResponse.json(
          {
            success: false,
            message: "등록된 사용자를 찾을 수 없습니다.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "사용자 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "등록된 사용자를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email: profile.email,
        register_date: profile.register_date,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "사용자 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

