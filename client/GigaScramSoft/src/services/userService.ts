import { apiService } from "./api";
import { ApiResponse } from "../types/api.types";
import { UserProfile } from "../types/api.types";

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
    return apiService.get<UserProfile>("/User/GetProfile");
  }
}

export const userService = new UserService();
