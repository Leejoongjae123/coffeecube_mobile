export interface PasswordResetRequest {
  code: string;
  password: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ResetPasswordPageProps {
  searchParams: Promise<{
    code?: string;
    access_token?: string;
    refresh_token?: string;
    type?: string;
  }>;
}

export interface AccountClientProps {
  accessToken?: string;
  refreshToken?: string;
  type?: string;
  isSessionReady?: boolean; // 서버에서 세션이 이미 설정되었는지 여부
  sessionData?: {
    access_token: string;
    refresh_token: string;
  } | null; // 서버에서 code exchange로 얻은 세션 데이터
}
