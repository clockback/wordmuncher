import { Answer, InflectionAnswer, Result } from "@models";

export interface LinkQuestionRequestAPI {
    questionId: number;
}

export interface LinkQuestionResponseAPISuccess {
    id: number;
    questionText: string;
    isStudyingLanguage: boolean;
    tonguePairId: number;
    inflectionTypeId: number | null;
    answers: Answer[];
    inflectionAnswers: InflectionAnswer[];
    result: Result;
    createdAt: Date;
    updatedAt: Date;
}

export interface LinkQuestionResponseAPIFailure {
    error: string;
}

export type LinkQuestionResponseAPI =
    | LinkQuestionResponseAPISuccess
    | LinkQuestionResponseAPIFailure;
