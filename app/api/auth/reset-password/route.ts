import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "이메일 주소를 입력해주세요." },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "올바른 이메일 주소를 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 환경변수 확인
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/reset-password/account`,
    });

    if (error) {
      // 더 구체적인 에러 메시지 제공
      let errorMessage = "비밀번호 재설정 이메일 전송에 실패했습니다.";

      if (error.message.includes("Email address not authorized")) {
        errorMessage =
          "이 이메일 주소로는 비밀번호 재설정 이메일을 보낼 수 없습니다. 관리자에게 문의하세요.";
      } else if (error.message.includes("rate limit")) {
        errorMessage =
          "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.";
      } else if (error.message.includes("SMTP")) {
        errorMessage =
          "이메일 서비스 설정에 문제가 있습니다. 관리자에게 문의하세요.";
      }

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "비밀번호 재설정 이메일이 전송되었습니다.",
      data,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
