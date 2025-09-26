"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";

export default function AccountClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState<{
    isDuplicate: boolean;
    message: string;
  } | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // 비밀번호 유효성 검사 함수들
  const validatePasswordLength = (password: string) => password.length >= 8;

  const validatePasswordComplexity = (password: string) => {
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasNumbers && hasSpecialChar;
  };

  const handleBack = () => {
    router.push("/auth/signup/phone");
  };

  const handleCheckDuplicate = async () => {
    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    setIsCheckingEmail(true);

    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "오류가 발생했습니다.");
        return;
      }

      setEmailCheckResult({
        isDuplicate: data.isDuplicate,
        message: data.message,
      });
      setIsEmailChecked(true);
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleNext = async () => {
    if (!isSignupEnabled) {
      return;
    }

    setIsSigningUp(true);

    try {
      // sessionStorage에서 인증된 전화번호 가져오기
      const verifiedPhoneNumber = sessionStorage.getItem(
        "verified_phone_number"
      );

      if (!verifiedPhoneNumber) {
        alert("전화번호 인증 정보가 없습니다. 다시 인증해 주세요.");
        router.push("/auth/signup/phone");
        return;
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          phone_number: verifiedPhoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "회원가입에 실패했습니다.");
        return;
      }

      // 회원가입 성공 시 sessionStorage 정리
      sessionStorage.removeItem("verified_phone_number");

      router.push("/auth/signup/complete");
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSigningUp(false);
    }
  };

  // 이메일이 변경되면 중복 확인 상태 초기화
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setIsEmailChecked(false);
    setEmailCheckResult(null);
  };

  // 회원가입 버튼 활성화 조건
  const isSignupEnabled =
    !!email.trim() &&
    !!password.trim() &&
    !!confirmPassword.trim() &&
    password === confirmPassword &&
    validatePasswordLength(password) &&
    validatePasswordComplexity(password) &&
    isEmailChecked &&
    !!emailCheckResult &&
    !emailCheckResult.isDuplicate;

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
            <div className="flex flex-col justify-center items-center w-8 h-8 bg-neutral-300 min-h-8 rounded-[100px]">
              <div>1</div>
            </div>
            <div className="flex flex-col justify-center items-center w-8 h-8 bg-green-600 min-h-8 rounded-[100px]">
              <div>2</div>
            </div>
          </div>

          <div className="mt-12 w-full">
            <div className="w-full text-lg font-semibold leading-none text-neutral-700">
              <div className="text-neutral-700">계정 정보를 입력해주세요</div>
            </div>

            <div className="mt-4 w-full">
              <div className="flex gap-3 items-center p-3 w-full bg-white border-b border-gray-200">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="이메일을 입력해주세요"
                  className="flex-1 text-base font-medium leading-8 text-stone-500 bg-transparent border-none outline-none min-w-0"
                />
                <Button
                  onClick={handleCheckDuplicate}
                  disabled={isCheckingEmail || !email.trim()}
                  className="flex gap-2.5 justify-center items-center px-3.5 py-2.5 text-xs font-bold text-center text-white bg-primary rounded-md hover:bg-primary/90 h-[34px] flex-shrink-0 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isCheckingEmail ? "확인중..." : "중복확인"}
                </Button>
              </div>

              {isEmailChecked && emailCheckResult && (
                <div className="flex flex-col gap-1.5 items-start px-3 mt-2 w-full text-xs font-medium leading-6 justify-center">
                  {!emailCheckResult.isDuplicate ? (
                    <div className="flex gap-1.5 items-center">
                      <Check className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square text-green-600" />
                      <div className="self-stretch my-auto text-green-600">
                        {emailCheckResult.message}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1.5 items-center">
                      <Image
                        src="/same.svg"
                        alt="duplicate"
                        width={16}
                        height={16}
                      />
                      <div className="self-stretch my-auto text-[#DE1443]">
                        {emailCheckResult.message}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-10 justify-between items-center p-3 mt-2 w-full text-base font-medium leading-8 text-center whitespace-nowrap bg-white border-b border-gray-200 text-stone-500">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력해주세요"
                  className="self-stretch my-auto bg-transparent border-none outline-none flex-1 text-left"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="self-stretch my-auto"
                >
                  {showPassword ? (
                    <EyeOff className="object-contain shrink-0 self-stretch my-auto aspect-square w-[22px]" />
                  ) : (
                    <Eye className="object-contain shrink-0 self-stretch my-auto aspect-square w-[22px]" />
                  )}
                </button>
              </div>

              <div className="flex gap-10 justify-between items-center p-3 mt-2 w-full text-base font-medium leading-8 text-center whitespace-nowrap bg-white border-b border-gray-200 text-stone-500">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 재입력해주세요"
                  className="self-stretch my-auto bg-transparent border-none outline-none flex-1 text-left"
                />
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="self-stretch my-auto"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="object-contain shrink-0 self-stretch my-auto aspect-square w-[22px]" />
                  ) : (
                    <Eye className="object-contain shrink-0 self-stretch my-auto aspect-square w-[22px]" />
                  )}
                </button>
              </div>

              {/* 비밀번호 유효성 검사 표시 */}
              {password && (
                <div className="flex flex-col gap-1.5 items-start px-3 mt-2 w-full text-xs font-medium leading-6">
                  <div className="flex gap-1.5 items-center">
                    <Check
                      className={`object-contain shrink-0 self-stretch my-auto w-4 aspect-square ${
                        validatePasswordComplexity(password)
                          ? "text-green-600"
                          : "text-gray-300"
                      }`}
                    />
                    <div
                      className={`self-stretch my-auto ${
                        validatePasswordComplexity(password)
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      숫자, 특수문자가 포함되어 있습니다.
                    </div>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <Check
                      className={`object-contain shrink-0 self-stretch my-auto w-4 aspect-square ${
                        validatePasswordLength(password)
                          ? "text-green-600"
                          : "text-gray-300"
                      }`}
                    />
                    <div
                      className={`self-stretch my-auto ${
                        validatePasswordLength(password)
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      비밀번호 길이가 최소 8자리수 이상입니다.
                    </div>
                  </div>
                  {confirmPassword && (
                    <div className="flex gap-1.5 items-center">
                      <Check
                        className={`object-contain shrink-0 self-stretch my-auto w-4 aspect-square ${
                          password === confirmPassword
                            ? "text-green-600"
                            : "text-gray-300"
                        }`}
                      />
                      <div
                        className={`self-stretch my-auto ${
                          password === confirmPassword
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {password === confirmPassword
                          ? "비밀번호가 일치합니다."
                          : "비밀번호가 일치하지 않습니다."}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 pt-5 pb-10 w-full text-lg font-bold text-center text-white whitespace-nowrap">
          <Button
            onClick={handleNext}
            disabled={!isSignupEnabled || isSigningUp}
            className={`flex gap-2.5 justify-center items-center p-4 w-full rounded-lg h-[53px] ${
              isSignupEnabled && !isSigningUp
                ? "bg-primary hover:bg-primary/90 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSigningUp ? "회원가입 중..." : "회원가입"}
          </Button>
        </div>
      </div>
    </div>
  );
}
