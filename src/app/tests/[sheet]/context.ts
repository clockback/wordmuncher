import { Dispatch, SetStateAction, createContext } from "react";

import { Answer, Question, Sheet } from "@models";

interface TestSheetContextType {
    attemptedAlready: boolean;
    currentAnswer: string;
    expectedAnswer: Answer | null;
    inflectionAnswers: Map<string, string>;
    lastQuestions: number[];
    nextQuestion: Question;
    numberOfQuestions: number;
    numberOfStars: number;
    pending: boolean;
    question: Question;
    questionNumber: number;
    numberCorrect: number;
    numberIncorrect: number;
    setCurrentAnswer: Dispatch<SetStateAction<string>>;
    setExpectedAnswer: Dispatch<SetStateAction<Answer | null>>;
    setInflectionAnswers: Dispatch<SetStateAction<Map<string, string>>>;
    setLastQuestions: Dispatch<SetStateAction<number[]>>;
    setNextQuestion: Dispatch<SetStateAction<Question | null>>;
    setNumberCorrect: Dispatch<SetStateAction<number>>;
    setNumberIncorrect: Dispatch<SetStateAction<number>>;
    setPending: Dispatch<SetStateAction<boolean>>;
    setQuestion: Dispatch<SetStateAction<Question>>;
    setQuestionNumber: Dispatch<SetStateAction<number>>;
    setShowMessageToFinish: Dispatch<SetStateAction<boolean>>;
    setShowResults: Dispatch<SetStateAction<boolean>>;
    sheet: Sheet;
    showMessageToFinish: boolean;
    showResults: boolean;
    startingNumberOfStars: number;
    submitAnswer: () => void;
}

const testSheetContext = createContext<TestSheetContextType | undefined>(
    undefined,
);
export default testSheetContext;
