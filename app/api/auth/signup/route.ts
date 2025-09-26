import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { encryptPassword } from "@/lib/crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, password, phone_number } = await request.json();

    if (!email || !password || !phone_number) {
      return NextResponse.json(
        { error: "이메일, 비밀번호, 전화번호는 필수입니다." },
        { status: 400 }
      );
    }
    const supabase = await createClient();

    // 1. Supabase Auth에 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "사용자 생성에 실패했습니다." },
        { status: 400 }
      );
    }

    // 2. 사용자 생성 완료 확인 후 profiles 테이블 업데이트
    // 일반 사용자 권한으로 처리 (admin 권한 대신)
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      return NextResponse.json(
        { error: "로그인에 실패했습니다." },
        { status: 400 }
      );
    }

    // 사용자 생성이 확인된 후 profiles 업데이트
    const encryptedPassword = encryptPassword(password);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        email,
        phone_no: phone_number,
        role: "client",
        encrypted_password: encryptedPassword,
        register_date: new Date().toISOString(),
        last_at: new Date().toISOString(),
        is_out: false,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      return NextResponse.json(
        { error: "프로필 업데이트에 실패했습니다." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
