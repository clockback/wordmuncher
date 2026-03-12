export interface SearchQuestionResult {
    id: number;
    questionText: string;
    isStudyingLanguage: boolean;
    sheetNames: string[];
    mainAnswer: string;
}

export interface SearchQuestionsResponseAPI {
    questions: SearchQuestionResult[];
}
