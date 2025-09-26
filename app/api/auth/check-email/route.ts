import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "이메일을 입력해주세요." },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // profiles 테이블에서 이메일 중복 확인
    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116은 "no rows returned" 에러 코드 (데이터가 없음을 의미)
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 데이터가 존재하면 중복, 없으면 사용 가능
    const isDuplicate = !!data;

    return NextResponse.json({
      isDuplicate,
      message: isDuplicate
        ? "이미 사용 중인 이메일입니다."
        : "사용 가능한 이메일입니다.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
