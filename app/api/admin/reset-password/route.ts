import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { encryptPassword } from "@/lib/crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "이메일과 새 비밀번호는 필수입니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 해당 이메일의 사용자 확인
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 새 비밀번호 암호화
    const encryptedPassword = encryptPassword(newPassword);

    if (!encryptedPassword) {
      return NextResponse.json(
        { error: "비밀번호 암호화에 실패했습니다." },
        { status: 500 }
      );
    }

    // profiles 테이블 업데이트
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        encrypted_password: encryptedPassword,
      })
      .eq("id", profile.id);

    if (updateError) {
      return NextResponse.json(
        { error: "비밀번호 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "비밀번호가 성공적으로 재설정되었습니다.",
      email: profile.email,
      encrypted_password: encryptedPassword,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
