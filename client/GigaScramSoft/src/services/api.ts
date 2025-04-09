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
        
        if (config.url?.includes('SetScore')) {
          console.log(`%c[VOTING REQUEST] ${config.method?.toUpperCase()} ${config.url}`, 'background: #e0f7fa; color: #006064; font-weight: bold', {
            tokenFirstChars: tokenValue.substring(0, 20) + '...',
            params: config.params,
            query: config.url.split('?')[1],
            time: new Date().toISOString()
          });
        } else if (config.url?.includes('GetScore')) {
          console.log(`%c[SCORE REQUEST] ${config.method?.toUpperCase()} ${config.url}`, 'background: #fff9c4; color: #827717; font-weight: bold', {
            tokenFirstChars: tokenValue.substring(0, 20) + '...',
            time: new Date().toISOString()
          });
        } else {
          console.log(`Request to ${config.url}: Added token to headers`, {
            tokenFirstChars: tokenValue.substring(0, 20) + '...',
            method: config.method,
            url: config.url,
          });
        }
      } else {
        console.warn(`Request to ${config.url}: Token is not in localStorage`);
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => {
        if (response.config.url?.includes('SetScore')) {
          console.log(`%c[VOTING RESPONSE] ${response.config.url}`, 'background: #e8f5e9; color: #2e7d32; font-weight: bold', {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            isPositive: response.config.url.includes('isPositive=true'),
            contentId: new URLSearchParams(response.config.url.split('?')[1]).get('contentId'),
            time: new Date().toISOString()
          });
        } else if (response.config.url?.includes('GetScore')) {
          console.log(`%c[SCORE RESPONSE] ${response.config.url}`, 'background: #fffde7; color: #f57f17; font-weight: bold', {
            status: response.status,
            statusText: response.statusText,
            score: response.data.data,
            contentId: new URLSearchParams(response.config.url.split('?')[1]).get('contentId'),
            time: new Date().toISOString()
          });
        }
        return response;
      },
      (error: AxiosError) => {
        console.error('API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          message: error.message,
          data: error.response?.data
        });

        if (error.config?.url?.includes('SetScore') || error.config?.url?.includes('GetScore')) {
          console.error('Voting error details:', {
            responseData: error.response?.data,
            url: error.config?.url,
            requestParams: error.config?.params
          });
          
          return Promise.reject(error);
        }

        if (error.response?.status === 401) {
          console.error('Unauthorized request:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response.status,
            message: error.message
          });
          
          if (!error.config?.url?.includes('SetScore') && 
              !error.config?.url?.includes('GetScore')) {
            localStorage.removeItem('token');
            window.location.href = '/';
          }
        } else if (error.response?.status === 404) {
          console.error('Resource not found:', {
            url: error.config?.url, 
            method: error.config?.method
          });
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
      const requestUrl = error.config?.url || '';
      
      if (requestUrl.includes('SetScore')) {
        return new Error('Authentication required for voting');
      }
      
      return new Error('Authorization required');
    }
    
    if (error.response?.status === 404) {
      const requestUrl = error.config?.url || '';
      
      if (requestUrl.includes('SetScore')) {
        return new Error('Voting endpoint not found');
      }
      
      return new Error('Resource not found');
    }
    
    if (error.response?.status === 500) {
      const requestUrl = error.config?.url || '';
      if (requestUrl.includes('Login')) {
				return new Error('Invalid login or password');
      }
      
      if (requestUrl.includes('SetScore')) {
        return new Error('Server error while voting');
      }
      
      return new Error('Server side Error');
    }
    
    const message = (error.response?.data as { message?: string })?.message || 'Failed Request';
    return new Error(message);
  }
}

export const apiService = ApiService.getInstance();