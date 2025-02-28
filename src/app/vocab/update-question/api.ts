import { Answer, InflectionAnswer } from "@models";

export interface UpdateQuestionRequestAPIWithAnswers {
    id: number;
    proposedQuestionText: string;
    proposedMainAnswer: string;
    proposedOtherAnswers: string[];
}

export interface UpdateQuestionRequestAPIWithInflectionAnswers {
    id: number;
    proposedQuestionText: string;
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
    answers: Answer[];
    inflectionAnswers: InflectionAnswer[];
}

export type UpdateQuestionResponseAPIFailure = Record<string, never>;

export type UpdateQuestionResponseAPI =
    | UpdateQuestionResponseAPISuccess
    | UpdateQuestionResponseAPIFailure;
