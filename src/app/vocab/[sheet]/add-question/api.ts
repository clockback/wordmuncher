import { Answer, InflectionAnswer, Result } from "@models";

export interface AddQuestionRequestAPIWithAnswers {
    proposedQuestionText: string;
    isStudyingLanguage: boolean;
    proposedMainAnswer: string;
    proposedOtherAnswers: string[];
}

export interface AddQuestionRequestAPIWithInflectionAnswers {
    proposedQuestionText: string;
    isStudyingLanguage: boolean;
    proposedInflectionType: number;
    proposedInflectionAnswers: {
        primaryFeature: number;
        secondaryFeature?: number;
        answer: string;
    }[];
}

export type AddQuestionRequestAPI =
    | AddQuestionRequestAPIWithAnswers
    | AddQuestionRequestAPIWithInflectionAnswers;

export interface AddQuestionResponseAPISuccess {
    id: number;
    tonguePairId: number;
    inflectionTypeId: number;
    answers: Answer[];
    inflectionAnswers: InflectionAnswer[];
    createdAt: Date;
    updatedAt: Date;
    result: Result;
}

export type AddQuestionResponseAPIFailure = Record<string, never>;

export type AddQuestionResponseAPI =
    | AddQuestionResponseAPISuccess
    | AddQuestionResponseAPIFailure;
