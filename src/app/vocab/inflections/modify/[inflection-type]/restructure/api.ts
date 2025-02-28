export interface RestructureInflectionsRequestAPI {
    primaryCategory: { name: string; id: number };
    secondaryCategory: { name: string; id: number };
    primaryFeatures: { name: string; id: number }[];
    secondaryFeatures: { name: string; id: number }[];
}

export type RestructureInflectionsResponseAPI = Record<string, never>;
