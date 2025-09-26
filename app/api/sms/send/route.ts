import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { phone_number } = await request.json();

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

    // 3분 후 만료 시간 설정
    const expiryAt = new Date();
    expiryAt.setMinutes(expiryAt.getMinutes() + 3);

    const supabase = await createClient();

    // SMS 테이블에 인증번호 저장
    const { error: insertError } = await supabase.from("sms").insert({
      code: verificationCode,
      phone_number: phone_number,
      expiry_at: expiryAt.toISOString(),
    });

    if (insertError) {
      return NextResponse.json(
        { success: false, message: "인증번호 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 알리고 SMS API로 문자 발송
    const aligoResponse = await fetch("https://apis.aligo.in/send/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        key: process.env.NEXT_PUBLIC_ALIGO_API_KEY!,
        user_id: process.env.NEXT_PUBLIC_ALIGO_USER_ID!,
        sender: process.env.NEXT_PUBLIC_ALIGO_SENDER_NUMBER!,
        receiver: phone_number,
        msg: `[커피큐브] 인증번호는 [${verificationCode}]입니다. 3분 이내에 입력해주세요.`,
        msg_type: "SMS",
      }),
    });

    console.log("aligoResponse:", aligoResponse);

    const aligoResult = await aligoResponse.json();
    console.log("aligoResult:", aligoResult);
    if (aligoResult.result_code <= 0) {
      return NextResponse.json(
        { success: false, message: "문자 발송에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "인증번호가 발송되었습니다.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
