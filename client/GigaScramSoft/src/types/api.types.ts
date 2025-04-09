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
  email?: string;
  roleName: string;
  avatar?: string;
  createdAt?: string;
}

export interface UpdateProfileRequest {
  login?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  avatar?: string;
} 