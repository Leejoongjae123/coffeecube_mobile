"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { UserFoundData, FindUserResponse } from "../types";

export default function AccountClient() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserFoundData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // sessionStorage에서 인증된 전화번호 가져오기
        const verifiedPhoneNumber = sessionStorage.getItem(
          "verified_phone_number"
        );

        if (!verifiedPhoneNumber) {
          setError("전화번호 인증 정보가 없습니다. 다시 인증해 주세요.");
          return;
        }

        const response = await fetch("/api/auth/find-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone_number: verifiedPhoneNumber,
          }),
        });

        const result: FindUserResponse = await response.json();

        if (result.success && result.data) {
          setUserData(result.data);
        } else {
          setError(result.message || "사용자 정보를 찾을 수 없습니다.");
        }
      } catch {
        setError("사용자 정보 조회 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleBack = () => {
    router.push("/auth/find-password/phone");
  };

  const handleGoToLogin = () => {
    // sessionStorage 정리
    sessionStorage.removeItem("verified_phone_number");
    router.push("/auth/login");
  };

  const handleSendResetEmail = async () => {
    if (!userData?.email) {
      setError("사용자 이메일 정보를 찾을 수 없습니다.");
      return;
    }

    setIsSendingEmail(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEmailSent(true);
        // sessionStorage 정리 - 이메일 전송 완료 후
        sessionStorage.removeItem("verified_phone_number");
      } else {
        let errorMessage = result.message || "이메일 전송에 실패했습니다.";

        // 개발 환경에서는 더 자세한 오류 정보 표시
        if (result.details && process.env.NODE_ENV === "development") {
          errorMessage += ` (상세: ${result.details})`;
        }

        setError(errorMessage);
      }
    } catch (networkError) {
      console.error("Network error:", networkError);
      setError("네트워크 연결을 확인하고 다시 시도해주세요.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="overflow-hidden bg-white w-full h-screen flex flex-col">
        <div className="relative flex h-[60px] items-center justify-center text-lg font-medium text-neutral-700">
          <Image
            src="/arrow.svg"
            alt="back"
            width={24}
            height={24}
            className="absolute left-5 cursor-pointer"
            onClick={handleBack}
          />
          <div>비밀번호 찾기</div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center p-5">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-red-500">⚠️</span>
            </div>
            <div className="text-lg font-semibold text-neutral-700 mb-2">
              {userData ? "이메일 전송 실패" : "계정을 찾을 수 없습니다"}
            </div>
            <div className="text-base text-gray-500 mb-8">{error}</div>
            {userData ? (
              <div className="space-y-3 w-full">
                <Button
                  onClick={handleSendResetEmail}
                  disabled={isSendingEmail}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-[53px] rounded-lg"
                >
                  {isSendingEmail ? "전송 중..." : "다시 시도하기"}
                </Button>
                <Button
                  onClick={handleGoToLogin}
                  variant="outline"
                  className="w-full h-[53px] rounded-lg"
                >
                  로그인으로 돌아가기
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleBack}
                className="w-full bg-primary hover:bg-primary/90 text-white h-[53px] rounded-lg"
              >
                다시 시도하기
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white w-full h-screen flex flex-col">
      <div className="relative flex h-[60px] items-center justify-center text-lg font-medium text-neutral-700">
        <Image
          src="/arrow.svg"
          alt="back"
          width={24}
          height={24}
          className="absolute left-5 cursor-pointer"
          onClick={handleBack}
        />
        <div>비밀번호 찾기</div>
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col justify-center p-5 w-full">
          <div className="flex gap-3 items-start self-end text-base font-bold text-white whitespace-nowrap">
            <div className="flex flex-col justify-center items-center w-8 h-8 bg-neutral-300 min-h-8 rounded-[100px]">
              <div>1</div>
            </div>
            <div className="flex flex-col justify-center items-center w-8 h-8 bg-green-600 min-h-8 rounded-[100px]">
              <div>2</div>
            </div>
          </div>

          <div className="mt-12 w-full">
            {!emailSent ? (
              <>
                <div className="w-full text-lg text-[#3C3C3C] font-semibold leading-[1.5] text-[18px] mb-6">
                  아래 계정으로
                  <br />
                  비밀번호 변경메일을 발송하시겠습니까?
                </div>

                <div className="text-[#3C3C3C] bg-gray-50 rounded-lg p-6 mb-6 rounded-[8px] p-6 w-[320px] h-[104px] text-[14px] flex flex-col justify-center items-start gap-y-2">
                  <div>아이디: {userData?.email}</div>
                  <div>가입일: {formatDate(userData?.register_date || "")}</div>
                </div>

                <Button
                  onClick={handleSendResetEmail}
                  disabled={isSendingEmail}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-[53px] rounded-lg mb-4"
                >
                  {isSendingEmail ? "전송 중..." : "비밀번호 변경메일 발송"}
                </Button>

                <Button
                  onClick={handleGoToLogin}
                  variant="outline"
                  className="w-full h-[53px] rounded-lg"
                >
                  로그인으로 돌아가기
                </Button>
              </>
            ) : (
              <>
                <div className="w-full text-lg text-[#3C3C3C] font-semibold leading-[1.5] text-[18px] mb-6">
                  아래의 계정으로
                  <br />
                  비밀번호 변경메일이 발송되었습니다
                </div>

                <div className="text-[#3C3C3C] bg-gray-50 rounded-lg p-6 mb-6 rounded-[8px] p-6 w-[320px] h-[104px] text-[14px] flex flex-col justify-center items-start gap-y-2">
                  <div>아이디: {userData?.email}</div>
                  <div>가입일: {formatDate(userData?.register_date || "")}</div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-sm text-green-600 mb-2">
                    ✓ 이메일이 성공적으로 전송되었습니다
                  </div>
                </div>

                <Button
                  onClick={handleGoToLogin}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-[53px] rounded-lg"
                >
                  로그인으로 돌아가기
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
