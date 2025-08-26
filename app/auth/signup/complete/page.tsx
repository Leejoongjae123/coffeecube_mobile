"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function Page() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);



  const handleStart = () => {
    router.push("/home");
  };


  return (
    <div className="overflow-hidden bg-white w-full h-screen flex flex-col">
      {/* 중앙 완료 메시지 */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center w-full gap-3">
          <Image src="/check.svg" width={43} height={43} alt="check"></Image>
          <div className="text-primary text-[16px] font-semibold">
            회원가입이 완료되었습니다.
          </div>
        </div>
      </div>
      
      {/* 하단 고정 버튼 */}
      <div className="px-5 pt-5 pb-10 w-full">
        <Button onClick={handleStart} className="flex gap-2.5 justify-center items-center p-4 w-full rounded-lg bg-primary hover:bg-primary/90 text-white h-[53px]">
          시작하기
        </Button>
      </div>
    </div>
  );
}
