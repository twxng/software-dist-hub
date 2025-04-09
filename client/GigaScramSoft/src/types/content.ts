export interface MainCategory {
  id: number;
  name: string;
}

export interface SubCategory {
  id: number;
  name: string;
  mainCategoryId: number;
  mainCategory: MainCategory;
}

export interface ContentUnitDTO {
  header: string;
  shortDescription: string;
  fullDescription: string;
  previewImage: string;
  downloadLink: string;
  subCategoryName: string;
  images: string[];
}

export interface ContentUnit {
  id: number;
  header: string;
  shortDescription: string;
  fullDescription: string;
  previewImage: string;
  creationDate: string;
  downloadLink: string;
  subCategoryId: number;
  score: number;
  rating?: number;
  subCategory?: {
    id: number;
    name: string;
    mainCategory?: {
      id: number;
      name: string;
    }
  };
  images: ContentUnitImageModel[];
}

export interface ContentUnitImageModel {
  id: number;
  value: string;
  contentUnitId: number;
  contentUnit: ContentUnit | null;
}

export interface ContentUnitSubCategoryModel {
  id: number;
  name: string;
  mainCategoryId: number;
  mainCategory: ContentUnitMainCategoryModel;
}

export interface ContentUnitMainCategoryModel {
  id: number;
  name: string;
}

export interface ContentImage {
  id: number;
  value: string;
  contentUnitId: number;
  contentUnit: string;
}

export interface Category {
  id: number;
  name: string;
  subCategories: SubCategory[];
}

export interface CreateContentRequest {
  header: string;
  shortDescription: string;
  fullDescription: string;
  previewImage: string;
  downloadLink: string;
  subCategoryId: number;
  images: string[];
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  version: string;
  rating: number;
  icon?: string;
  downloadedAt?: Date;
}