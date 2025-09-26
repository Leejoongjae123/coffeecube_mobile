export interface UserFoundData {
  email: string;
  register_date: string;
}

export interface FindUserResponse {
  success: boolean;
  data?: UserFoundData;
  message?: string;
  error?: string;
}
