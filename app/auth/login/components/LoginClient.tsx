"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function LoginClient() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: userId,
        password,
      });
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/main");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center px-5 bg-white h-screen w-full">
      <div className="flex flex-col gap-y-3 items-center mb-[51px]">
        <div className="flex flex-col gap-3 items-center self-stretch max-md:gap-4 max-sm:gap-5">
          <Image src="/logo.svg" alt="logo" width={163.8} height={66.46} />
        </div>
        <div className="self-stretch text-[12px] font-medium leading-5 text-center text-green-600 max-md:text-xs max-md:leading-4 max-sm:px-2 max-sm:py-0 max-sm:text-xs max-sm:leading-4">
          더 많은 곳에서의 창조와 환경, 그 이상의 실천
        </div>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4 items-center self-stretch max-md:gap-5 max-sm:gap-6">
        <div className="flex flex-col gap-8 items-start self-stretch max-md:gap-7 max-sm:gap-6">
          <div className="flex flex-col gap-y-2 items-start self-stretch max-md:gap-3 max-sm:gap-2.5">
            <Input
              type="email"
              placeholder="아이디를 입력해주세요"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className="flex gap-2.5 items-center self-stretch p-4 rounded-lg border border-solid bg-neutral-50 border-zinc-100 max-md:p-3.5 max-sm:p-3 text-sm font-medium text-stone-300 placeholder:text-[#CCCCCC] h-[49px]"
            />
            <Input
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex gap-2.5 items-center self-stretch p-4 rounded-lg border border-solid bg-neutral-50 border-zinc-100 max-md:p-3.5 max-sm:p-3 text-sm font-medium text-stone-300 placeholder:text-[#CCCCCC] h-[49px]"
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button type="submit" disabled={isLoading} className="flex gap-2.5 justify-center items-center self-stretch p-4 bg-primary hover:bg-primary/90 rounded-lg cursor-pointer h-[54px]">
            <span className="text-lg font-bold text-center text-white max-md:text-base max-sm:text-sm">
              {isLoading ? "로그인 중..." : "로그인"}
            </span>
          </Button>
        </div>

        <div className="flex gap-3 justify-center items-center max-md:gap-2.5 max-sm:flex-wrap max-sm:gap-2">
          <Link href="/auth/forgot-password" className="text-sm font-medium text-center text-green-600 cursor-pointer max-md:text-sm max-sm:text-xs hover:underline">
            아이디 찾기
          </Link>
          <div className="w-px h-3 bg-green-600"></div>
          <Link href="/auth/signup/phone" className="text-sm font-medium text-center text-green-600 cursor-pointer max-md:text-sm max-sm:text-xs hover:underline">
            회원가입
          </Link>
        </div>
      </form>
    </div>
  );
}


