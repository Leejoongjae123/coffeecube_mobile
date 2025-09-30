import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptPassword } from "@/lib/crypto";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 현재 로그인한 사용자 정보 가져오기
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    // profiles 테이블에서 사용자 정보 조회
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, encrypted_password")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (!profile.email || !profile.encrypted_password) {
      return NextResponse.json(
        { error: "필수 프로필 데이터가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 서버 사이드에서 안전하게 복호화
    const decryptedPassword = decryptPassword(profile.encrypted_password);

    if (!decryptedPassword) {
      return NextResponse.json(
        { error: "비밀번호 복호화에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      email: profile.email,
      password: decryptedPassword,
      encrypted_password: profile.encrypted_password,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
