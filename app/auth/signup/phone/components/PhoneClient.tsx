"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function PhoneClient() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // 타이머 효과
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleBack = () => {
    router.push("/auth/login");
  };

  const handleNext = async () => {
    if (!verificationCode.trim()) {
      setModalState({
        isOpen: true,
        title: "인증 필요",
        message: "인증번호를 입력해주세요.",
      });
      return;
    }

    setVerifyLoading(true);
    try {
      const response = await fetch("/api/sms/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          code: verificationCode,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 인증 성공 시 전화번호를 sessionStorage에 저장
        sessionStorage.setItem("verified_phone_number", phoneNumber);
        router.push("/auth/signup/account");
      } else {
        setModalState({
          isOpen: true,
          title: "인증 실패",
          message: result.message || "인증번호가 일치하지 않습니다.",
        });
      }
    } catch {
      setModalState({
        isOpen: true,
        title: "오류",
        message: "인증 중 오류가 발생했습니다.",
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setModalState({
        isOpen: true,
        title: "전화번호 입력",
        message: "전화번호를 입력해주세요.",
      });
      return;
    }
    

    setIsLoading(true);
    try {
      console.log("[Client] SMS 발송 요청:", phoneNumber);
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
        }),
      });

      const result = await response.json();
      console.log("[Client] SMS 발송 응답:", result);

      if (result.success) {
        setIsCodeSent(true);
        setTimeLeft(180); // 3분 = 180초
        setVerificationCode("");
        setModalState({
          isOpen: true,
          title: "발송 완료",
          message: "인증번호가 발송되었습니다.",
        });
      } else {
        const errorDetail = result.error ? `\n상세: ${result.error}` : "";
        setModalState({
          isOpen: true,
          title: "발송 실패",
          message:
            (result.message || "문자 발송에 실패했습니다.") + errorDetail,
        });
      }
    } catch (error) {
      console.error("[Client] SMS 발송 예외:", error);
      setModalState({
        isOpen: true,
        title: "오류",
        message: "문자 발송 중 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      title: "",
      message: "",
    });
  };

  return (
    <div className="overflow-hidden bg-white w-full h-screen flex flex-col">
      <div className="relative flex h-[60px] items-center justify-center text-lg font-medium text-neutral-700">
        <Image
          src="/arrow.svg"
          alt="logo"
          width={24}
          height={24}
          className="absolute left-5 cursor-pointer"
          onClick={handleBack}
        />
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
              <div className="text-neutral-700">
                본인 인증을 위해
                <br />
                전화번호를 입력해주세요.
              </div>
            </div>
            <div className="mt-4 w-full">
              <div className="flex gap-3 items-center w-full">
                <Input
                  type="tel"
                  placeholder="010-1234-5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 h-12 text-base border-0 border-b border-gray-200 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary"
                />
              </div>
              <div className="mt-6 w-full">
                <div className="flex gap-4 items-center w-full border-0 border-b border-gray-200 focus-within:border-primary">
                  <Input
                    type="text"
                    placeholder="인증번호를 입력해주세요"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="flex-1 h-12 text-base border-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-0"
                    disabled={!isCodeSent}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSendCode}
                    disabled={
                      !phoneNumber || isLoading || (isCodeSent && timeLeft > 0)
                    }
                    className="flex gap-2.5 justify-center items-center px-3.5 py-2.5 text-xs w-[93px] h-[34px] font-bold text-center text-white rounded-md bg-primary hover:bg-primary/90 disabled:bg-gray-300"
                  >
                    {isLoading
                      ? "발송중..."
                      : isCodeSent && timeLeft > 0
                      ? "재발송"
                      : "인증번호 발송"}
                  </Button>
                </div>
                {isCodeSent && (
                  <div className="flex items-center justify-between mt-2 w-full text-xs font-medium leading-6">
                    <div className="text-green-600">
                      인증번호가 발송되었습니다.
                    </div>
                    {timeLeft > 0 && (
                      <div className="text-primary font-bold">
                        {formatTime(timeLeft)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 pt-5 pb-10 w-full text-lg font-bold text-center text-white whitespace-nowrap">
          <Button
            onClick={handleNext}
            disabled={!isCodeSent || !verificationCode.trim() || verifyLoading}
            className="flex gap-2.5 justify-center items-center p-4 w-full rounded-lg bg-primary hover:bg-primary/90 text-white h-[53px] disabled:bg-gray-300"
          >
            {verifyLoading ? "인증 중..." : "다음으로"}
          </Button>
        </div>
      </div>

      {/* 모달 */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
      >
        <p className="text-gray-700">{modalState.message}</p>
      </Modal>
    </div>
  );
}
