export interface DeleteQuestionRequestAPI {
    id: number;
    sheetId: number;
}

export interface DeleteQuestionResponseAPISuccess {
    deleted: boolean;
}

export interface DeleteQuestionResponseAPIFailure {
    error: string;
}

export type DeleteQuestionResponseAPI =
    | DeleteQuestionResponseAPISuccess
    | DeleteQuestionResponseAPIFailure;
