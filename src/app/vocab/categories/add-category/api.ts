export interface AddCategoryRequestAPI {
    categoryName: string;
    parentCategoryId: number | null;
}

export interface AddCategoryResponseAPI {
    success: boolean;
    categoryId: number;
    error?: string;
}
