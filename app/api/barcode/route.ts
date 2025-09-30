import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { decryptPassword } from "@/lib/crypto";
import JsBarcode from "jsbarcode";
import { createCanvas } from "canvas";

export async function GET() {
  console.log("🚀 바코드 API 호출됨!");
  try {
    const supabase = await createClient();
    console.log("✅ Supabase 클라이언트 생성됨");

    // 현재 로그인한 사용자 정보 가져오기
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("❌ 인증 오류:", authError?.message || "사용자 없음");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ 사용자 인증 성공:", user.id);

    // profiles 테이블에서 사용자 정보 조회
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, encrypted_password")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.log(
        "❌ 프로필 조회 오류:",
        profileError?.message || "프로필 없음"
      );
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    console.log("✅ 프로필 조회 성공");

    if (!profile.email || !profile.encrypted_password) {
      console.log("❌ 필수 프로필 데이터 누락:", {
        hasEmail: !!profile.email,
        hasPassword: !!profile.encrypted_password,
      });
      return NextResponse.json(
        { error: "Required profile data missing" },
        { status: 400 }
      );
    }

    // 암호화된 비밀번호 복호화
    const decryptedPassword = decryptPassword(profile.encrypted_password);

    // 바코드 데이터 생성 (email + 탭 + 복호화된 password)
    const barcodeData = `${profile.email}\t${decryptedPassword}`;

    // 디버깅용 로그 - email과 decrypted password 출력
    console.log("=== 바코드 데이터 디버깅 ===");
    console.log("📧 Email:", profile.email);
    console.log("🔐 Encrypted Password:", profile.encrypted_password);
    console.log("🔓 Decrypted Password:", decryptedPassword);
    console.log("📊 Final Barcode Data:", barcodeData);
    console.log("📏 Barcode Data Length:", barcodeData.length);
    console.log("==========================");

    // 바코드 이미지 생성
    console.log("🎨 바코드 이미지 생성 시작...");
    const canvas = createCanvas(400, 100);

    JsBarcode(canvas, barcodeData, {
      format: "CODE128",
      width: 2,
      height: 80,
      displayValue: false,
      background: "#ffffff",
      lineColor: "#000000",
    });

    console.log("✅ 바코드 이미지 생성 완료");
    const pngBuffer = canvas.toBuffer("image/png");
    console.log("✅ PNG 버퍼 생성 완료, 크기:", pngBuffer.length, "bytes");

    // 이미지 응답 반환
    return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.log("💥 바코드 생성 중 오류 발생:", error);
    return NextResponse.json(
      { error: "Barcode generation failed" },
      { status: 500 }
    );
  }
}
