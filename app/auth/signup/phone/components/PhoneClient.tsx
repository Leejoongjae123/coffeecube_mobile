"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PhoneClient() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);

  const handleBack = () => {
    router.push("/auth/login");
  };

  const handleNext = () => {
    router.push("/auth/signup/account");
  };

  const handleSendCode = () => {
    setIsCodeSent(true);
  };

  return (
    <div className="overflow-hidden bg-white w-full h-screen flex flex-col">
      <div className="relative flex h-[60px] items-center justify-center text-lg font-medium text-neutral-700">
        <Image src="/arrow.svg" alt="logo" width={24} height={24} className="absolute left-5 cursor-pointer" onClick={handleBack} />
        <div>회원가입</div>
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col justify-center p-5 w-full">
          <div className="flex gap-3 items-start self-end text-base font-bold text-white whitespace-nowrap">
            <div className="flex flex-col justify-center items-center w-8 h-8 bg-green-600 min-h-8 rounded-[100px]">
              <div>1</div>
            </div>
            <div className="flex flex-col justify-center items-center w-8 h-8 bg-neutral-300 min-h-8 rounded-[100px]">
              <div>2</div>
            </div>
          </div>
          <div className="mt-12 w-full">
            <div className="w-full text-lg font-semibold leading-6 text-neutral-700">
              <div className="text-neutral-700">본인 인증을 위해<br/>전화번호를 입력해주세요.</div>
            </div>
            <div className="mt-4 w-full">
              <div className="flex gap-3 items-center w-full">
                <Input type="tel" placeholder="010-1234-5678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="flex-1 h-12 text-base border-0 border-b border-gray-200 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary" />
              </div>
              <div className="mt-6 w-full">
                <div className="flex gap-4 items-center w-full">
                  <Input type="text" placeholder="인증번호를 입력해주세요" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} className="flex-1 h-12 text-base border-0 border-b border-gray-200 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary" disabled={!isCodeSent} />
                  <Button variant="secondary" size="sm" onClick={handleSendCode} disabled={!phoneNumber} className="flex gap-2.5 justify-center items-center px-3.5 py-2.5 text-xs w-[93px] h-[34px] font-bold text-center text-white rounded-md bg-primary hover:bg-primary/90 disabled:bg-gray-300">인증번호 발송</Button>
                </div>
                {isCodeSent && (
                  <div className="flex items-center mt-2 w-full text-xs font-medium leading-6 text-green-600">
                    <div className="self-stretch my-auto">인증번호가 발송되었습니다.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 pt-5 pb-10 w-full text-lg font-bold text-center text-white whitespace-nowrap">
          <Button onClick={handleNext} className="flex gap-2.5 justify-center items-center p-4 w-full rounded-lg bg-primary hover:bg-primary/90 text-white h-[53px]">다음으로</Button>
        </div>
      </div>
    </div>
  );
}


