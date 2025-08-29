import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex relative flex-col px-6 py-8 h-[calc(100vh-76px)]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[#BFDEC1]"
       
      />

      {/* Logo */}
      <div className="relative z-10">
        <Image src="/logo2.svg" alt="logo" width={134} height={41} />
      </div>

      {/* Plant Image */}
      <div className="absolute top-[100px] right-[42px] z-10">
        <Image src="/plant.svg" alt="plant" width={96} height={167} />
      </div>

      {/* Bottom Content - Main Text and Barcode */}
      <div className="relative z-10 flex flex-col justify-end flex-1">
        {/* Main Text Content */}
        <div className="mb-6">
          <h1 className="text-xl leading-7 mb-2 text-primary font-bold">
            더 나은 지구를 위해,
            <br />
            비니봇과 함께 실천하세요.
          </h1>
          <p className="text-xs font-medium leading-5 opacity-90 text-primary tracking-tighter">
            이곳은 비니봇에 대한 간단한 소개가 적힐 구간입니다.
            <br />
            비니봇에 대한 정보 또는 로그인 프로세스 설명이 있을 예정입니다.
          </p>
        </div>

        {/* Barcode Card */}
        <Card className="p-5 text-base text-black bg-white rounded-xl shadow-[0px_0px_10px_rgba(0,0,0,0.12)] border-0">
          <div className="text-[16px] font-bold text-left text-black mb-[18px]">로그인 바코드</div>
          <Image src="/barcode.png" alt="barcode" width={281} height={50} />
        </Card>
      </div>
    </div>
  );
}
