"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { AccountClientProps } from "../types";

function AccountClientContent({
  accessToken,
  refreshToken,
  type,
  isSessionReady,
  sessionData,
}: AccountClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // 비밀번호 변경 관련 상태
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // 서버에서 세션이 설정되었거나 토큰이 있으면 비밀번호 재설정 모드
  const isPasswordResetMode =
    isSessionReady || (accessToken && refreshToken && type === "recovery");

  const handleGoToLogin = () => {
    router.push("/auth/login");
  };

  const handlePasswordChange = async () => {
    if (!password || !confirmPassword) {
      setError("비밀번호와 비밀번호 확인을 모두 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setIsChangingPassword(true);
    setError(null);

    try {
      const supabase = createClient();

      // 현재 세션 상태 확인
      const {
        data: { session },
        error: sessionCheckError,
      } = await supabase.auth.getSession();

      console.log("현재 세션 상태:", {
        hasSession: !!session,
        sessionUser: session?.user?.id,
        isSessionReady,
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
        type,
        sessionCheckError,
      });

      // 세션이 없는 경우 적절한 토큰으로 세션 설정
      if (!session) {
        let sessionTokens = null;

        // 1. 서버에서 code exchange로 얻은 세션 데이터 우선 사용
        if (isSessionReady && sessionData) {
          sessionTokens = sessionData;
          console.log("서버에서 얻은 세션 데이터로 설정 시도...");
        }
        // 2. URL 파라미터의 토큰 사용
        else if (accessToken && refreshToken && type === "recovery") {
          sessionTokens = {
            access_token: accessToken,
            refresh_token: refreshToken,
          };
          console.log("URL 파라미터 토큰으로 설정 시도...");
        }

        if (sessionTokens) {
          const { error: sessionError } = await supabase.auth.setSession(
            sessionTokens
          );

          if (sessionError) {
            console.error("세션 설정 에러:", sessionError);
            let sessionErrorMessage = "세션 설정에 실패했습니다.";

            if (sessionError.message.includes("expired")) {
              sessionErrorMessage =
                "링크가 만료되었습니다. 새로운 비밀번호 재설정 링크를 요청해주세요.";
            } else if (sessionError.message.includes("invalid")) {
              sessionErrorMessage =
                "유효하지 않은 링크입니다. 새로운 비밀번호 재설정 링크를 요청해주세요.";
            }

            setError(sessionErrorMessage);
            return;
          }
          console.log("세션 설정 완료");
        } else {
          console.error("사용 가능한 세션 토큰이 없습니다");
          setError(
            "인증 정보가 없습니다. 비밀번호 재설정 링크를 다시 확인해주세요."
          );
          return;
        }
      }

      // 세션 재확인
      const {
        data: { session: finalSession },
        error: finalSessionError,
      } = await supabase.auth.getSession();
      console.log("최종 세션 상태:", {
        hasSession: !!finalSession,
        sessionUser: finalSession?.user?.id,
        finalSessionError,
      });

      if (!finalSession) {
        console.error("최종 세션 확인 실패");
        setError(
          "인증 세션을 설정할 수 없습니다. 비밀번호 재설정 링크가 만료되었을 수 있습니다. 새로운 링크를 요청해주세요."
        );
        return;
      }

      // 비밀번호 업데이트
      console.log("비밀번호 업데이트 시도...");
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error("비밀번호 업데이트 에러:", updateError);
        let errorMessage = "비밀번호 변경에 실패했습니다.";

        if (updateError.message.includes("session_not_found")) {
          errorMessage =
            "세션이 만료되었습니다. 비밀번호 재설정을 다시 요청해주세요.";
        } else if (updateError.message.includes("Password should be")) {
          errorMessage = "비밀번호는 최소 6자 이상이어야 합니다.";
        } else if (updateError.message.includes("Invalid session")) {
          errorMessage =
            "유효하지 않은 세션입니다. 비밀번호 재설정을 다시 요청해주세요.";
        } else if (updateError.message.includes("User not found")) {
          errorMessage =
            "사용자를 찾을 수 없습니다. 비밀번호 재설정을 다시 요청해주세요.";
        }

        // 개발 환경에서는 상세한 에러 정보 표시
        if (process.env.NODE_ENV === "development") {
          errorMessage += ` (상세 정보: ${updateError.message})`;
        }

        setError(errorMessage);
      } else {
        console.log("비밀번호 업데이트 성공");
        setPasswordChanged(true);
      }
    } catch (catchError) {
      console.error("비밀번호 변경 중 예외 발생:", catchError);
      setError("네트워크 연결을 확인하고 다시 시도해주세요.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 비밀번호 재설정 모드가 아닌 경우 에러 표시
  if (!isPasswordResetMode) {
    return (
      <div className="overflow-hidden bg-white w-full h-screen flex flex-col">
        <div className="relative flex h-[60px] items-center justify-center text-lg font-medium text-neutral-700">
          <div>비밀번호 재설정</div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center p-5">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-red-500">⚠️</span>
            </div>
            <div className="text-lg font-semibold text-neutral-700 mb-2">
              링크 오류
            </div>
            <div className="text-base text-gray-500 mb-8">
              유효하지 않은 비밀번호 재설정 링크입니다.
            </div>
            <Button
              onClick={handleGoToLogin}
              className="w-full bg-primary hover:bg-primary/90 text-white h-[53px] rounded-lg"
            >
              로그인으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 이메일 링크를 통한 비밀번호 재설정 모드인 경우
  if (isPasswordResetMode) {
    if (passwordChanged) {
      return (
        <div className="overflow-hidden bg-white w-full h-screen flex flex-col">
          <div className="relative flex h-[60px] items-center justify-center text-lg font-medium text-neutral-700">
            <div>비밀번호 변경 완료</div>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center p-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-green-500">✓</span>
              </div>
              <div className="text-lg font-semibold text-neutral-700 mb-2">
                비밀번호가 성공적으로 변경되었습니다
              </div>
              <div className="text-base text-gray-500 mb-8">
                새로운 비밀번호로 로그인해주세요.
              </div>
              <Button
                onClick={handleGoToLogin}
                className="w-full bg-primary hover:bg-primary/90 text-white h-[53px] rounded-lg"
              >
                로그인하기
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-hidden bg-white w-full h-screen flex flex-col">
        <div className="relative flex h-[60px] items-center justify-center text-lg font-medium text-neutral-700">
          <div>새 비밀번호 설정</div>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col justify-center p-5 w-full">
            <div className="mt-12 w-full">
              <div className="w-full text-lg text-[#3C3C3C] font-semibold leading-[1.5] text-[18px] mb-6">
                새로운 비밀번호를
                <br />
                설정해주세요
              </div>

              {error && (
                <div className="text-red-500 text-sm mb-4 text-center">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 비밀번호 (최소 6자)
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="새 비밀번호를 입력하세요"
                    className="w-full h-[53px] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    className="w-full h-[53px] rounded-lg"
                  />
                </div>
              </div>

              <Button
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !password || !confirmPassword}
                className="w-full bg-primary hover:bg-primary/90 text-white h-[53px] rounded-lg mb-4"
              >
                {isChangingPassword ? "변경 중..." : "비밀번호 변경"}
              </Button>

              <Button
                onClick={handleGoToLogin}
                variant="outline"
                className="w-full h-[53px] rounded-lg"
              >
                로그인으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 이 페이지는 이제 이메일 링크를 통해서만 접근할 수 있습니다
  return (
    <div className="overflow-hidden bg-white w-full h-screen flex flex-col">
      <div className="relative flex h-[60px] items-center justify-center text-lg font-medium text-neutral-700">
        <div>비밀번호 재설정</div>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center p-5">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-500">⚠️</span>
          </div>
          <div className="text-lg font-semibold text-neutral-700 mb-2">
            접근 오류
          </div>
          <div className="text-base text-gray-500 mb-8">
            이 페이지는 비밀번호 재설정 이메일을 통해서만 접근할 수 있습니다.
          </div>
          <Button
            onClick={handleGoToLogin}
            className="w-full bg-primary hover:bg-primary/90 text-white h-[53px] rounded-lg"
          >
            로그인으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AccountClient(props: AccountClientProps) {
  return (
    <Suspense
      fallback={
        <div className="overflow-hidden bg-white w-full h-screen flex flex-col">
          <div className="relative flex h-[60px] items-center justify-center text-lg font-medium text-neutral-700">
            <div>비밀번호 재설정</div>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center p-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="text-lg font-semibold text-neutral-700 mb-2">
                페이지를 로드하고 있습니다
              </div>
              <div className="text-base text-gray-500">
                잠시만 기다려주세요...
              </div>
            </div>
          </div>
        </div>
      }
    >
      <AccountClientContent {...props} />
    </Suspense>
  );
}
