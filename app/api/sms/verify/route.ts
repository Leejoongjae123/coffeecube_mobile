import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { phone_number, code } = await request.json();

    if (!phone_number || !code) {
      return NextResponse.json(
        { success: false, message: "전화번호와 인증번호가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 가장 최근에 발송된 인증번호 조회
    const { data, error } = await supabase
      .from("sms")
      .select("*")
      .eq("phone_number", phone_number)
      .eq("code", code)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return NextResponse.json(
        { success: false, message: "인증번호가 일치하지 않습니다." },
        { status: 400 }
      );
    }

    const smsRecord = data[0];
    const now = new Date();
    const expiryTime = new Date(smsRecord.expiry_at);

    // 만료 시간 확인
    if (now > expiryTime) {
      return NextResponse.json(
        {
          success: false,
          message: "인증번호가 만료되었습니다. 새로운 인증번호를 요청해주세요.",
        },
        { status: 400 }
      );
    }

    // 인증 성공 시 해당 SMS 레코드 삭제 (보안상)
    await supabase.from("sms").delete().eq("id", smsRecord.id);

    return NextResponse.json({
      success: true,
      message: "인증이 완료되었습니다.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
