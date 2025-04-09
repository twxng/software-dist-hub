import { apiService } from './api';
import { ContentUnit, ContentUnitSubCategoryModel } from '../types/content';
import { ApiResponse } from '../types/api.types';
import { ContentUnitDTO } from '../types/content';
// import { apiClient } from './apiClient';
import { stripBase64Prefix } from '../utils/imageUtils';

// Додаємо інтерфейс ContentPageDTO
interface ContentPageDTO {
	contentUnits: ContentUnitDTO[];
	subCategory: ContentUnitSubCategoryModel | null;
	pageNumber: number;
	totalNumberOfPages: number;
	isTheLastPage: boolean;
}

export const contentService = {
	async getCategories(): Promise<ApiResponse<ContentUnitSubCategoryModel[]>> {
		return await apiService.get<ContentUnitSubCategoryModel[]>('/GetAllCategories');
	},

	async getSubCategories(mainCategoryId: number): Promise<ApiResponse<ContentUnitSubCategoryModel[]>> {
		return await apiService.get<ContentUnitSubCategoryModel[]>(`/GetSubCategories?mainCategoryId=${mainCategoryId}`);
	},

	async createContent(contentData: ContentUnitDTO): Promise<ApiResponse<ContentUnit>> {
		// Переконуємося, що зображення не мають префіксів
		const sanitizedContentData = {
			...contentData,
			previewImage: contentData.previewImage.startsWith('data:') 
				? stripBase64Prefix(contentData.previewImage) 
				: contentData.previewImage,
			images: contentData.images.map(img => 
				img.startsWith('data:') ? stripBase64Prefix(img) : img
			)
		};

		console.log('Sending content:', sanitizedContentData);
		const contentAsRecord = { ...sanitizedContentData } as unknown as Record<string, unknown>;
		try {
			const response = await apiService.post<ContentUnit>('/Create', contentAsRecord, {
				headers: { 'Content-Type': 'application/json' }
			});
			return response;
		} catch (error) {
			console.error('Error creating content:', error);
			return { 
				statusCode: 500, 
				data: {
					id: 0,
					header: '',
					shortDescription: '',
					fullDescription: '',
					previewImage: '',
					creationDate: '',
					downloadLink: '',
					subCategoryId: 0,
					score: 0,
					images: []
				}, 
				message: error instanceof Error ? error.message : 'Error creating content'
			};
		}
	},

	async updateContent(id: number, contentData: ContentUnitDTO): Promise<ApiResponse<ContentUnit>> {
		// Переконуємося, що зображення не мають префіксів
		const sanitizedContentData = {
			...contentData,
			previewImage: contentData.previewImage.startsWith('data:') 
				? stripBase64Prefix(contentData.previewImage) 
				: contentData.previewImage,
			images: contentData.images.map(img => 
				img.startsWith('data:') ? stripBase64Prefix(img) : img
			)
		};

		console.log('Sending content:', sanitizedContentData);
		const contentAsRecord = { ...sanitizedContentData } as unknown as Record<string, unknown>;
		try {
			const response = await apiService.put<ContentUnit>(`/Update?contentId=${id}`, contentAsRecord);
			return response;
		} catch (error) {
			console.error('Error updating content:', error);
			return { 
				statusCode: 500, 
				data: {
					id: 0,
					header: '',
					shortDescription: '',
					fullDescription: '',
					previewImage: '',
					creationDate: '',
					downloadLink: '',
					subCategoryId: 0,
					score: 0,
					images: []
				}, 
				message: error instanceof Error ? error.message : 'Error updating content'
			};
		}
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
				data: {
					id: 0,
					header: '',
					shortDescription: '',
					fullDescription: '',
					previewImage: '',
					creationDate: '',
					downloadLink: '',
					subCategoryId: 0,
					score: 0,
					images: []
				},
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

	async upvoteContent(contentUnitId: number): Promise<ApiResponse<boolean>> {
		try {
			console.log(`Upvoting content ${contentUnitId}...`);
			const token = localStorage.getItem('token');
			if (!token) {
				console.error('No JWT token found in localStorage for voting!');
				return { 
					statusCode: 401, 
					data: false, 
					message: 'Authentication required for voting',
					error: true
				};
			}
			
			console.log(`Auth token for voting: ${token.substring(0, 20)}...`);
			
			const response = await apiService.put<boolean>(`/SetScore?contentId=${contentUnitId}&isPositive=true`, {});
			
			console.log(`Upvote response for content ${contentUnitId}:`, response);
			return response;
		} catch (error) {
			console.error('Error upvoting content:', error);
			// Перевіряємо специфічні помилки авторизації
			if (error instanceof Error && error.message === 'Authorization required') {
				return { 
					statusCode: 401, 
					data: false, 
					message: 'Please login to vote',
					error: true
				};
			}
			return { 
				statusCode: 500, 
				data: false, 
				message: error instanceof Error ? error.message : 'Error upvoting content',
				error: true
			};
		}
	},

	async downvoteContent(contentUnitId: number): Promise<ApiResponse<boolean>> {
		try {
			console.log(`Downvoting content ${contentUnitId}...`);
			const token = localStorage.getItem('token');
			if (!token) {
				console.error('No JWT token found in localStorage for voting!');
				return { 
					statusCode: 401, 
					data: false, 
					message: 'Authentication required for voting',
					error: true
				};
			}
			
			console.log(`Auth token for voting: ${token.substring(0, 20)}...`);
			
			const response = await apiService.put<boolean>(`/SetScore?contentId=${contentUnitId}&isPositive=false`, {});
			
			console.log(`Downvote response for content ${contentUnitId}:`, response);
			return response;
		} catch (error) {
			console.error('Error downvoting content:', error);
			// Перевіряємо специфічні помилки авторизації
			if (error instanceof Error && error.message === 'Authorization required') {
				return { 
					statusCode: 401, 
					data: false, 
					message: 'Please login to vote',
					error: true
				};
			}
			return { 
				statusCode: 500, 
				data: false, 
				message: error instanceof Error ? error.message : 'Error downvoting content',
				error: true
			};
		}
	},

	async getContentScore(contentUnitId: number): Promise<ApiResponse<number>> {
		try {
			console.log(`Getting score for content ${contentUnitId}...`);
			const response = await apiService.get<number>(`/GetScore?contentId=${contentUnitId}`);
			console.log(`Score response for content ${contentUnitId}:`, response);
			return response;
		} catch (error) {
			console.error('Error getting content score:', error);
			return {
				statusCode: 500,
				data: 0,
				message: error instanceof Error ? error.message : 'Error getting content score',
				error: true
			};
		}
	},

	async searchContentByName(searchQuery: string, page: number = 1, categoryId: number = 0): Promise<ApiResponse<ContentPageDTO>> {
		try {
			console.log(`[searchContentByName] Starting search for: "${searchQuery}" (page: ${page}, category: ${categoryId})`);
			
			// Використовуємо пусту строку, якщо searchQuery не визначений
			const searchPattern = searchQuery ? searchQuery.trim() : '';
			
			// Строка запиту
			const queryString = new URLSearchParams({
				searchPattern,
				pageNumber: page.toString(),
				// Додаємо параметр категорії тільки якщо він валідний (більше 0)
				...(categoryId > 0 ? { subCategoryId: categoryId.toString() } : {}),
				unitsPerPage: '10'
			}).toString();
			
			console.log(`[searchContentByName] Sending request: /SearchByName?${queryString}`);
			const response = await apiService.get<ContentPageDTO>(`/SearchByName?${queryString}`);
			
			console.log(`[searchContentByName] Response status:`, response.statusCode);
			
			if (response && response.statusCode === 200) {
				// Відображаємо результати пошуку
				const resultCount = response.data?.contentUnits?.length || 0;
				const totalResults = response.data?.totalNumberOfPages 
					? (response.data.totalNumberOfPages - 1) * 10 + resultCount 
					: resultCount;
					
				console.log(`[searchContentByName] Found ${totalResults} items matching search criteria`);
				
				return {
					statusCode: response.statusCode,
					message: response.message || `Found ${totalResults} items matching "${searchQuery}"`,
					data: response.data,
					error: false
				};
			}
			
			// Обробка помилки або порожнього результату
			return {
				statusCode: response.statusCode || 404,
				message: response.message || 'No results found',
				data: {
					contentUnits: [],
					pageNumber: page,
					totalNumberOfPages: 0,
					isTheLastPage: true,
					subCategory: null
				},
				error: response.statusCode !== 200
			};
		} catch (error) {
			console.error('[searchContentByName] Error searching content:', error);
			return {
				data: {
					contentUnits: [],
					pageNumber: page,
					totalNumberOfPages: 0,
					isTheLastPage: true,
					subCategory: null
				},
				message: error instanceof Error ? error.message : 'Error searching content',
				statusCode: 500,
				error: true
			};
		}
	},

	// Метод для пошуку за категорією та підкатегорією
	async searchByCategory(searchQuery: string, subCategoryId: number, page: number = 1): Promise<ApiResponse<ContentPageDTO>> {
		try {
			// Перевірка на коректність вхідних параметрів
			if (subCategoryId <= 0) {
				console.warn('[searchByCategory] Invalid subCategoryId:', subCategoryId);
				
				// Якщо категорія не валідна, але є пошуковий запит - використовуємо стандартний пошук за назвою
				if (searchQuery && searchQuery.trim()) {
					console.log(`[searchByCategory] Redirecting to searchContentByName with query: "${searchQuery}"`);
					return await this.searchContentByName(searchQuery, page);
				}
				
				return {
					data: {
						contentUnits: [],
						pageNumber: page,
						totalNumberOfPages: 0,
						isTheLastPage: true,
						subCategory: null
					},
					message: 'Invalid category ID',
					statusCode: 400,
					error: true
				};
			}
			
			// Використовуємо searchContentByName з категорією
			console.log(`[searchByCategory] Using searchContentByName with category ID ${subCategoryId}`);
			return await this.searchContentByName(searchQuery, page, subCategoryId);
		} catch (error) {
			console.error(`[searchByCategory] Error searching by category ${subCategoryId}:`, error);
			
			// При помилці, якщо є пошуковий запит - спробуємо загальний пошук
			if (searchQuery && searchQuery.trim()) {
				console.log(`[searchByCategory] Error occurred, trying general search for "${searchQuery}"`);
				try {
					return await this.searchContentByName(searchQuery, page);
				} catch (secondError) {
					console.error(`[searchByCategory] Error in fallback search:`, secondError);
				}
			}
			
			return {
				data: {
					contentUnits: [],
					pageNumber: page,
					totalNumberOfPages: 0,
					isTheLastPage: true,
					subCategory: null
				},
				message: error instanceof Error ? error.message : 'Error searching by category',
				statusCode: 500,
				error: true
			};
		}
	},

	async getSuggestions(searchQuery: string): Promise<ApiResponse<string[]>> {
		try {
			// Якщо запит пустий, повертаємо пустий масив
			if (!searchQuery || searchQuery.trim() === '') {
				return {
					data: [],
					message: 'Empty query',
					statusCode: 200
				};
			}
			
			console.log(`[getSuggestions] Getting suggestions for: "${searchQuery}"`);
			
			// Використовуємо новий ендпоінт для отримання і програм, і категорій
			try {
				const suggestionsResponse = await apiService.get<string[]>(`/GetSuggestions?query=${encodeURIComponent(searchQuery)}`);
				
				if (suggestionsResponse.statusCode === 200 && suggestionsResponse.data) {
					const suggestions = suggestionsResponse.data;
					console.log(`[getSuggestions] Got ${suggestions.length} suggestions from API`);
					
					// Якщо отримали пропозиції від API - повертаємо їх
					if (suggestions.length > 0) {
						return suggestionsResponse;
					}
					
					// Якщо пропозицій немає і запит дуже короткий (1-2 символи), пробуємо додаткові методи
					if (searchQuery.trim().length <= 2) {
						console.log(`[getSuggestions] Short query with no suggestions, trying to find content units`);
						
						// Отримуємо категорії для відображення в пропозиціях
						const categoriesResponse = await this.getCategories();
						if (categoriesResponse.statusCode === 200 && categoriesResponse.data) {
							const matchingCategories = categoriesResponse.data.filter(cat => 
								(cat.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
								(cat.mainCategory && cat.mainCategory.name.toLowerCase().includes(searchQuery.toLowerCase()))
							);
							
							console.log(`[getSuggestions] Found ${matchingCategories.length} matching categories`);
							
							if (matchingCategories.length > 0) {
								// Перетворюємо категорії в формат "MainCategory / SubCategory"
								const categorySuggestions = matchingCategories.map(cat => 
									`${cat.mainCategory?.name || 'Категорія'} / ${cat.name}`
								);
								
								// Додаємо сам пошуковий запит як підказку
								const allSuggestions = [searchQuery, ...categorySuggestions];
								
								console.log(`[getSuggestions] Returning ${allSuggestions.length} suggestions (including categories)`);
								
								return {
									data: allSuggestions,
									message: `Generated ${allSuggestions.length} suggestions`,
									statusCode: 200
								};
							}
						}
						
						// Якщо категорій немає, повертаємо хоча б сам запит
						console.log(`[getSuggestions] No matching categories, returning original query`);
						return {
							data: [searchQuery],
							message: 'No suggestions found, returning original query',
							statusCode: 200
						};
					}
				}
			} catch (error) {
				console.error('[getSuggestions] Error getting suggestions from API:', error);
				
				// Запасний варіант, якщо API не працює - повертаємо хоча б сам запит
				console.log(`[getSuggestions] API error, returning original query`);
				return {
					data: [searchQuery],
					message: 'Failed to get suggestions from API, returning original query',
					statusCode: 200
				};
			}
			
			// Якщо не вдалося отримати підказки, повертаємо сам запит як підказку
			console.log(`[getSuggestions] No suggestions found, returning original query`);
			return {
				data: [searchQuery],
				message: 'No suggestions found, returning original query',
				statusCode: 200
			};
		} catch (error) {
			console.error('[getSuggestions] Error getting suggestions:', error);
			
			// При будь-якій помилці повертаємо хоча б сам запит як підказку
			return {
				data: [searchQuery],
				message: 'Error getting suggestions, returning original query',
				statusCode: 200
			};
		}
	},

	async getPopularContent(onItemReceived?: (item: ContentUnit) => void): Promise<ApiResponse<ContentUnit[]>> {
		try {
			const allContent = await this.getAllContent(onItemReceived);
			
			if (allContent.statusCode === 200 && allContent.data) {
				// Сортуємо за рейтингом (від найвищого до найнижчого)
				const sortedContent = [...allContent.data].sort((a, b) => b.score - a.score);
				
				return {
					data: sortedContent,
					message: `Got ${sortedContent.length} popular content units`,
					statusCode: 200
				};
			}
			
			return allContent;
		} catch (error) {
			console.error('Error getting popular content:', error);
			return {
				data: [] as ContentUnit[],
				message: error instanceof Error ? error.message : 'Error getting popular content',
				statusCode: 500,
				error: true
			};
		}
	},
};