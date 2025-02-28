export interface AddInflectionsRequestAPI {
    inflectionName: string;
    categories: { categoryName: string; features: string[] }[];
}

export type AddInflectionsResponseAPI = Record<string, never>;
