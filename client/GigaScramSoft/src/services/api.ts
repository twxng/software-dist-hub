import axios, { AxiosError, AxiosInstance } from 'axios';
import { LoginRequest, LoginResponse, UserProfile, ApiResponse } from '../types/api.types';

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

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        config.headers.Authorization = tokenValue;
				console.log('Added token to headers:', config.headers.Authorization);
      } else {
				console.warn('Token is not in localStorage');
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
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
        const token = response.data.data;
        if (token.startsWith('Bearer ')) {
          localStorage.setItem('token', token);
        } else {
          localStorage.setItem('token', token);
        }
        console.log('Збережений токен:', localStorage.getItem('token'));
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
      return {
        data: null as unknown as UserProfile,
        message: (error as Error & { response?: { data?: { message?: string }, status?: number } })?.response?.data?.message || 'Реєстрація не вдалася',
        statusCode: (error as Error & { response?: { data?: { message?: string }, status?: number } })?.response?.status || 500
      };
    }
  }

  public async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // public async post<T>(url: string, data: any): Promise<ApiResponse<T>> {
  //   try {
  //     const response = await this.api.post(url, data);
  //     return response.data;
  //   } catch (error) {
  //     throw this.handleError(error as AxiosError);
  //   }
  // }

	public async post<T>(url: string, data: Record<string, unknown>, config = {}): Promise<ApiResponse<T>> {
		try {
			const response = await this.api.post(url, data, { ...config });
			return response.data;
		} catch (error) {
			throw this.handleError(error as AxiosError);
		}
	}


  public async put<T>(url: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  private handleError(error: AxiosError): Error {
    if (error.response?.status === 401) {
			return new Error('Authorization required');
    }
    
    if (error.response?.status === 500) {
      const requestUrl = error.config?.url || '';
      if (requestUrl.includes('Login')) {
				return new Error('Invalid login or password');
      }
      return new Error('Server side Error');
    }
    
    const message = (error.response?.data as { message?: string })?.message || 'Failed Request';
    return new Error(message);
  }
}

export const apiService = ApiService.getInstance();