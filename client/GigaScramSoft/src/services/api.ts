import axios, { AxiosError, AxiosInstance } from 'axios';
import { LoginRequest, LoginResponse, UserProfile, ApiResponse } from '../types/api.types';
import { useAuthStore } from '../store/authStore';

interface SignUpRequest {
  login: string;
  email: string;
  password: string;
}

class ApiService {
  private api: AxiosInstance;
  private static instance: ApiService;

  private constructor() {
    const baseURL = 'http://localhost:5050/';

    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      }
    );
  }

  public async login(credentials: LoginRequest): Promise<ApiResponse<string>> {
    try {
      const response = await this.api.post<LoginResponse>('Login', null, {
        params: {
          login: credentials.login,
          password: credentials.password
        }
      });
      
      if (response.data.statusCode === 200 && response.data.data) {
        localStorage.setItem('token', response.data.data);
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await this.api.get<ApiResponse<UserProfile>>('/User/GetProfile');
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async signUp(data: SignUpRequest): Promise<ApiResponse<UserProfile>> {
    try {
      const url = `SignUp?login=${data.login}&password=${data.password}&email=${data.email}`;
      const response = await this.api.post<ApiResponse<UserProfile>>(url);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 400) {
        return error.response.data as ApiResponse<UserProfile>;
      }
      const message = (error as any)?.response?.data?.message || 'Registration failed';
      return new Error(message);
    }
  }

  private handleError(error: AxiosError): Error {
    if (error.response?.status === 500) {
      return new Error('Invalid login or password');
    }
    const message = (error.response?.data as any)?.message || 'Request failed';
    return new Error(message);
  }
}

export const apiService = ApiService.getInstance();