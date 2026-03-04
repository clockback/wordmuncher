import { Question, Result } from "@models";

export interface SkipAnswerRequestAPI {
    questionId: number;
    lastQuestions: number[];
    retrieveNextAnswer: boolean;
}

export interface SkipAnswerResponseAPI {
    result: Result;
    nextQuestion: Question | null;
    lastQuestions: number[];
    expectedAnswer: string | null;
    inflectionCorrections: { [key: string]: string } | null;
    totalStars: number;
}
