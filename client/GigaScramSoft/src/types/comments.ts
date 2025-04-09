export interface User {
	id: number;
	login: string;
	email: string;
	roleName: string;
}

export interface Comment {
	id: number;
	text: string;
	value?: string;
	userId: number;
	user?: User;
	userName?: string;
	createdAt: string;
	contentUnitId: number;
}

export interface CommentsPage {
	comments: Comment[];
	pageNumber: number;
	totalNumberOfPages: number;
	totalComments?: number;
}

export interface CommentCreateModel {
	contentId: number;
	value: string;
} 