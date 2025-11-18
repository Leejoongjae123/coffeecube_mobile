import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { phone_number } = await request.json();
    console.log("[SMS Send] 요청 받음:", phone_number);

    if (!phone_number) {
      return NextResponse.json(
        { success: false, message: "전화번호가 필요합니다." },
        { status: 400 }
      );
    }

    // 6자리 인증번호 생성
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    console.log("[SMS Send] 인증번호 생성:", verificationCode);

    // 3분 후 만료 시간 설정
    const expiryAt = new Date();
    expiryAt.setMinutes(expiryAt.getMinutes() + 3);
    console.log("[SMS Send] 만료시간:", expiryAt.toISOString());

    const supabase = await createClient();

    // SMS 테이블에 인증번호 저장
    const { data: insertData, error: insertError } = await supabase
      .from("sms")
      .insert({
        code: verificationCode,
        phone_number: phone_number,
        expiry_at: expiryAt.toISOString(),
      })
      .select();

    if (insertError) {
      console.error("[SMS Send] DB 저장 실패:", insertError);
      return NextResponse.json(
        {
          success: false,
          message: "인증번호 저장 중 오류가 발생했습니다.",
          error: insertError.message,
        },
        { status: 500 }
      );
    }

    console.log("[SMS Send] DB 저장 성공:", insertData);

    // Supabase Edge Function을 통한 SMS 발송
    const { data: smsData, error: smsError } = await supabase.functions.invoke(
      "send-sms",
      {
        body: {
          phone_number: phone_number,
          cert_code: verificationCode,
        },
      }
    );

    if (smsError) {
      console.error("[SMS Send] Edge Function 호출 실패:", smsError);
      return NextResponse.json(
        {
          success: false,
          message: "문자 발송에 실패했습니다.",
          error: smsError.message,
        },
        { status: 500 }
      );
    }

    console.log("[SMS Send] Edge Function 응답:", smsData);

    // Edge Function 응답 확인
    if (!smsData?.ok) {
      console.error("[SMS Send] Edge Function 응답 실패:", smsData);
      return NextResponse.json(
        {
          success: false,
          message: "문자 발송에 실패했습니다.",
          detail: smsData,
        },
        { status: 500 }
      );
    }

    console.log("[SMS Send] 전체 프로세스 성공");
    return NextResponse.json({
      success: true,
      message: "인증번호가 발송되었습니다.",
    });
  } catch (error) {
    console.error("[SMS Send] 예외 발생:", error);
    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}
