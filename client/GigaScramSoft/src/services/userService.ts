import { apiService } from "./api";
import { ApiResponse, UserProfile, UpdateProfileRequest } from "../types/api.types";
import { ContentItem } from '../types/content';

class UserService {
  async getUserById(userId: number): Promise<ApiResponse<UserProfile>> {
    try {
      return await apiService.get<UserProfile>(
        `/User/GetById?userId=${userId}`
      );
    } catch (error) {
      console.error(` Error fetch user with ID ${userId}:`, error);
      return {
        data: null as unknown as UserProfile,
        message:
          error instanceof Error
            ? error.message
						: "Error getting a user",
        statusCode: 500,
        error: true,
      };
    }
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await apiService.get<UserProfile>("/User/GetProfile");
      console.log("Profile response:", response);
      return response;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return {
        data: null as unknown as UserProfile,
        message: error instanceof Error ? error.message : "Error getting user profile",
        statusCode: 500,
        error: true,
      };
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    try {
      // В реальному проекті це буде API-запит
      // Зараз симулюємо успішну відповідь
      console.log("Updating profile with data:", data);
      
      const mockResponse: ApiResponse<UserProfile> = {
        statusCode: 200,
        message: "Profile updated successfully",
        data: {
          id: "1",
          login: data.login || "user",
          email: data.email || "user@example.com",
          roleName: "User",
          avatar: data.avatar,
          createdAt: new Date().toISOString()
        }
      };
      
      // Зберігаємо дані в localStorage як тимчасове рішення
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return mockResponse;
    } catch (error) {
      console.error("Error updating profile:", error);
      return {
        data: null as unknown as UserProfile,
        message: error instanceof Error ? error.message : "Error updating profile",
        statusCode: 500,
        error: true,
      };
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<boolean>> {
    try {
      // В реальному проекті це буде API-запит
      // Зараз симулюємо успішну відповідь
      console.log("Changing password");
      
      // Перевірка поточного пароля була б на сервері
      return {
        statusCode: 200,
        message: "Password changed successfully",
        data: true
      };
    } catch (error) {
      console.error("Error changing password:", error);
      return {
        data: false,
        message: error instanceof Error ? error.message : "Error changing password",
        statusCode: 500,
        error: true,
      };
    }
  }

  async deleteAccount(): Promise<ApiResponse<boolean>> {
    try {
      // В реальному проекті це буде API-запит
      // Зараз симулюємо успішну відповідь
      console.log("Deleting account");
      
      return {
        statusCode: 200,
        message: "Account deleted successfully",
        data: true
      };
    } catch (error) {
      console.error("Error deleting account:", error);
      return {
        data: false,
        message: error instanceof Error ? error.message : "Error deleting account",
        statusCode: 500,
        error: true,
      };
    }
  }

  async uploadAvatar(file: File): Promise<ApiResponse<string>> {
    try {
      // В реальному проекті - відправка файлу на сервер
      // Симулюємо конвертацію в base64 для зберігання в localStorage
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          
          // Зберігаємо в localStorage
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          currentUser.avatar = base64String;
          localStorage.setItem('user', JSON.stringify(currentUser));
          
          resolve({
            statusCode: 200,
            message: "Avatar uploaded successfully",
            data: base64String
          });
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return {
        data: "",
        message: error instanceof Error ? error.message : "Error uploading avatar",
        statusCode: 500,
        error: true,
      };
    }
  }
}

export const userService = new UserService();

// Функція для отримання списку завантажень користувача
export const getUserDownloads = async (userId: string): Promise<ContentItem[]> => {
  // Використовуємо userId для отримання завантажень
  console.log(`Getting downloads for user with ID: ${userId}`);
  
  // Тут буде логіка отримання завантажень користувача з API
  // Для прикладу використовуємо мок-дані
  return [
    {
      id: '1',
      title: 'Windows 11',
      description: 'Latest version of Windows operating system with enhanced security features',
      version: '22H2',
      rating: 4.7,
      downloadedAt: new Date()
    },
    {
      id: '2',
      title: 'Adobe Photoshop 2023',
      description: 'Professional photo editing software with advanced AI features',
      version: '24.0',
      rating: 4.9,
      downloadedAt: new Date(Date.now() - 86400000) // Вчора
    },
    {
      id: '3',
      title: 'Visual Studio Code',
      description: 'Lightweight but powerful code editor with support for extensions',
      version: '1.76.0',
      rating: 4.8,
      downloadedAt: new Date(Date.now() - 172800000) // 2 дні тому
    }
  ];
};
