import { Answer, InflectionAnswer } from "@models";

export interface UpdateQuestionRequestAPIWithAnswers {
    id: number;
    proposedQuestionText: string;
    isStudyingLanguage: boolean;
    proposedMainAnswer: string;
    proposedOtherAnswers: string[];
}

export interface UpdateQuestionRequestAPIWithInflectionAnswers {
    id: number;
    proposedQuestionText: string;
    isStudyingLanguage: boolean;
    proposedInflectionType: number;
    proposedInflectionAnswers: {
        primaryFeature: number;
        secondaryFeature?: number;
        answer: string;
    }[];
}

export type UpdateQuestionRequestAPI =
    | UpdateQuestionRequestAPIWithAnswers
    | UpdateQuestionRequestAPIWithInflectionAnswers;

export interface UpdateQuestionResponseAPISuccess {
    questionId: number;
    questionText: string;
    isStudyingLanguage: boolean;
    answers: Answer[];
    inflectionAnswers: InflectionAnswer[];
}

export interface UpdateQuestionResponseAPIError {
    error: string;
}

export type UpdateQuestionResponseAPIFailure = Record<string, never>;

export type UpdateQuestionResponseAPI =
    | UpdateQuestionResponseAPISuccess
    | UpdateQuestionResponseAPIError
    | UpdateQuestionResponseAPIFailure;
