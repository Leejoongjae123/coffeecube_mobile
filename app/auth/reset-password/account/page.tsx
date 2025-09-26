import { createClient } from "@/utils/supabase/server";
import AccountClient from "./components/AccountClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ResetPasswordPageProps } from "./types";

export default async function Page(props: ResetPasswordPageProps) {
  const searchParams = await props.searchParams;
  const { code, access_token, refresh_token, type } = searchParams;

  // 유효한 파라미터가 있는지 확인
  const hasValidParams =
    code || (access_token && refresh_token && type === "recovery");

  if (!hasValidParams) {
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
            <Link href="/auth/login">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white h-[53px] rounded-lg">
                로그인으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // code가 있으면 서버에서 세션 설정
  let isSessionReady = false;
  let sessionData: { access_token: string; refresh_token: string } | null =
    null;

  if (code) {
    const supabase = await createClient();

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
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
                  세션 설정 실패
                </div>
                <div className="text-base text-gray-500 mb-8">
                  링크가 만료되었거나 이미 사용된 링크입니다.
                </div>
                <Link href="/auth/find-password/account">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white h-[53px] rounded-lg">
                    비밀번호 찾기 다시 시도
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );
      }

      // code exchange 성공 - 세션 데이터 저장
      if (data.session) {
        isSessionReady = true;
        sessionData = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        };
      }
    } catch {
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
                서버 오류
              </div>
              <div className="text-base text-gray-500 mb-8">
                잠시 후 다시 시도해주세요.
              </div>
              <Link href="/auth/login">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white h-[53px] rounded-lg">
                  로그인으로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <AccountClient
      accessToken={access_token}
      refreshToken={refresh_token}
      type={type}
      isSessionReady={isSessionReady}
      sessionData={sessionData}
    />
  );
}
