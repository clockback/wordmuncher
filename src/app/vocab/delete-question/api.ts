export interface DeleteQuestionRequestAPI {
    id: number; // The ID of the question to delete.
}

export interface DeleteQuestionResponseAPI {
    error?: string; // The error message if applicable.
}
