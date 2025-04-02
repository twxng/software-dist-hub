import { apiService } from './api';
import { ContentUnit, ContentUnitSubCategoryModel } from '../types/content';
import { ApiResponse } from '../types/api.types';
import { ContentUnitDTO } from '../types/content';

export const contentService = {
	async getCategories(): Promise<ApiResponse<ContentUnitSubCategoryModel[]>> {
		return await apiService.get<ContentUnitSubCategoryModel[]>('/GetAllCategories');
	},

	async getSubCategories(mainCategoryId: number): Promise<ApiResponse<ContentUnitSubCategoryModel[]>> {
		return await apiService.get<ContentUnitSubCategoryModel[]>(`/GetSubCategories?mainCategoryId=${mainCategoryId}`);
	},

	async createContent(content: ContentUnitDTO): Promise<ApiResponse<ContentUnit>> {
		console.log('Sending content:', content);
		const contentAsRecord = { ...content } as unknown as Record<string, unknown>;
		return await apiService.post<ContentUnit>('/Create', contentAsRecord, {
			headers: { 'Content-Type': 'application/json' }
		});
	},

	async updateContent(id: number, content: ContentUnitDTO): Promise<ApiResponse<ContentUnit>> {
		const contentAsRecord = { ...content } as unknown as Record<string, unknown>;
		return await apiService.put<ContentUnit>(`/Update?contentId=${id}`, contentAsRecord);
	},

	async getContentById(id: number): Promise<ApiResponse<ContentUnit>> {
		try {
			console.log(`Request for content by ID ${id}: /GetById?contentId=${id}`);
			const response = await apiService.get<ContentUnit>(`/GetById?contentId=${id}`);
			
			if (response.data && !response.data.subCategory) {
				console.warn(`Content with ID ${id} does not contain category information`);
			} else if (response.data && response.data.subCategory) {
				console.log(`Category for ID ${id}:`, 
					response.data.subCategory.mainCategory?.name, 
					'/', 
					response.data.subCategory.name
				);
			}
			
			console.log(`Response for ID ${id}:`, response);
			return response;
		} catch (error) {
			console.error(`Error getting content with ID ${id}:`, error);
			return {
				data: null as unknown as ContentUnit,
				message: error instanceof Error ? error.message : 'Error getting content',
				statusCode: 500,
				error: true
			};
		}
	},

	async deleteContent(id: number): Promise<ApiResponse<boolean>> {
		return await apiService.delete<boolean>(`/DeleteById?contentId=${id}`);
	},

	async testConnection(): Promise<ApiResponse<ContentUnitSubCategoryModel[]>> {
		return await apiService.get<ContentUnitSubCategoryModel[]>('/GetAllCategories');
	},

	async getAllContent(onItemReceived?: (item: ContentUnit) => void): Promise<ApiResponse<ContentUnit[]>> {
		try {
			console.log('Getting all content through GetById requests');
			
			const validContent: ContentUnit[] = [];
			const maxIdsToTry = 20;
			const priorityIds = [1, 2, 3, 4, 5];
						for (const id of priorityIds) {
				try {
					const response = await this.getContentById(id);
					if (response.statusCode === 200 && response.data) {
						validContent.push(response.data);
						
						if (onItemReceived) {
							onItemReceived(response.data);
						}
					}
				} catch {
					console.log(`Content with priority ID ${id} not found`);
				}
			}
			
			for (let id = 6; id <= maxIdsToTry; id++) {
				try {
					const response = await this.getContentById(id);
					if (response.statusCode === 200 && response.data) {
						validContent.push(response.data);
						
						if (onItemReceived) {
							onItemReceived(response.data);
						}
					}
				} catch {
					// Ignore errors for missing IDs
				}
			}
			
			console.log(`Successfully got ${validContent.length} content records`);
			
			return {
				data: validContent,
				message: `Got ${validContent.length} content units`,
				statusCode: 200
			};
		} catch (error) {
			console.error('Error getting all content:', error);
			return {
				data: [] as ContentUnit[],
				message: error instanceof Error ? error.message : 'Error getting content',
				statusCode: 500,
				error: true
			};
		}
	},
	
};