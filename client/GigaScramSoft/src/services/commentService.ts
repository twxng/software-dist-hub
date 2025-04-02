import { apiService } from "./api";
import { ApiResponse } from "../types/api.types";
import { CommentsPage } from "../types/comments";

class CommentService {
  async getComments(
    contentUnitId: number,
    pageNumber: number = 1
  ): Promise<ApiResponse<CommentsPage>> {
    return apiService.get<CommentsPage>(
      `/GetComments?contentUnitId=${contentUnitId}&pageNumber=${pageNumber}`
    );
  }

  async getCountOfPagesWithComments(
    contentUnitId: number
  ): Promise<ApiResponse<number>> {
    return apiService.get<number>(
      `/GetCountOfPagesWithComments?contentUnitId=${contentUnitId}`
    );
  }

  async createComment(model: {
    contentId: number;
    text: string;
  }): Promise<ApiResponse<any>> {
    const params = {
      contentId: model.contentId,
      value: model.text,
    };

    return apiService.post<any>("/CreateComment", null, {
      params: params,
    });
  }

  async removeComment(commentId: number): Promise<ApiResponse<any>> {
    return apiService.delete(`/RemoveComment?commentId=${commentId}`);
  }
}

export const commentService = new CommentService();
