import { Question, Result } from "@models";

export interface SubmitAnswerRequestAPI {
    questionId: number;
    submittedAnswer: string;
    submittedInflectionAnswers: { [key: string]: string } | null;
    lastQuestions: number[];
    attemptedAlready: boolean;
    retrieveNextAnswer: boolean;
}

export interface SubmitAnswerResponseAPICorrectOrIncorrect {
    correct: boolean;
    result: Result;
    nextQuestion: Question | null;
    lastQuestions: number[];
    expectedAnswer: string | null;
    reattemptAvailable: false;
    totalStars: number;
    done: boolean;
}

export interface SubmitAnswerResponseAPIClose {
    correct: boolean;
    reattemptAvailable: boolean;
}

export type SubmitAnswerResponseAPI =
    | SubmitAnswerResponseAPICorrectOrIncorrect
    | SubmitAnswerResponseAPIClose;
