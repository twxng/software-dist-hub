export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  data: string;
  message: string;
  statusCode: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  error?: boolean;
}

export interface UserProfile {
  id: string;
  login: string;
  roleName: string;
} 