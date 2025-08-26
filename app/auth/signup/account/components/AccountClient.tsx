"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";

export default function AccountClient() {
  const router = useRouter();
  const [username, setUsername] = useState("user_001");
  const [password, setPassword] = useState("*****");
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameChecked, setIsUsernameChecked] = useState(true);

  const handleBack = () => {
    router.push("/auth/signup/phone");
  };

  const handleCheckDuplicate = () => {
    setIsUsernameChecked(true);
  };

  const handleNext = () => {
    router.push("/auth/signup/complete");
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
            <div className="flex flex-col justify-center items-center w-8 h-8 bg-neutral-300 min-h-8 rounded-[100px]"><div>1</div></div>
            <div className="flex flex-col justify-center items-center w-8 h-8 bg-green-600 min-h-8 rounded-[100px]"><div>2</div></div>
          </div>

          <div className="mt-12 w-full">
            <div className="w-full text-lg font-semibold leading-none text-neutral-700">
              <div className="text-neutral-700">계정 정보를 입력해주세요</div>
            </div>

            <div className="mt-4 w-full">
              <div className="flex gap-3 items-center p-3 w-full bg-white border-b border-gray-200">
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="flex-1 text-base font-medium leading-8 text-stone-500 bg-transparent border-none outline-none min-w-0" />
                <Button onClick={handleCheckDuplicate} className="flex gap-2.5 justify-center items-center px-3.5 py-2.5 text-xs font-bold text-center text-white bg-primary rounded-md hover:bg-primary/90 h-[34px] flex-shrink-0">중복확인</Button>
              </div>

              {isUsernameChecked && (
                <div className="flex flex-col gap-1.5 items-start px-3 mt-2 w-full text-xs font-medium leading-6 text-green-600 justify-center">
                  <div className="flex gap-1.5 items-center"><Check className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square" /><div className="self-stretch my-auto">아이디가 중복되지 않습니다.</div></div>
                  <div className="flex gap-1.5 items-center"><Image src="/same.svg" alt="check" width={16} height={16} /><div className="self-stretch my-auto text-[#DE1443]">중복되는 아이디입니다.</div></div>
                </div>
              )}

              <div className="flex gap-10 justify-between items-center p-3 mt-2 w-full text-base font-medium leading-8 text-center whitespace-nowrap bg-white border-b border-gray-200 text-stone-500">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="self-stretch my-auto bg-transparent border-none outline-none flex-1 text-left" />
                <button onClick={() => setShowPassword(!showPassword)} className="self-stretch my-auto">
                  {showPassword ? <EyeOff className="object-contain shrink-0 self-stretch my-auto aspect-square w-[22px]" /> : <Eye className="object-contain shrink-0 self-stretch my-auto aspect-square w-[22px]" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pt-5 pb-10 w-full text-lg font-bold text-center text-white whitespace-nowrap">
          <Button onClick={handleNext} className="flex gap-2.5 justify-center items-center p-4 w-full rounded-lg bg-primary hover:bg-primary/90 text-white h-[53px]">회원가입</Button>
        </div>
      </div>
    </div>
  );
}


