export interface AddSheetRequestAPI {
    proposedName: string;
    categoryId?: number | null;
}

export interface AddSheetResponseAPI {
    success: boolean;
    sheetId: number;
}
