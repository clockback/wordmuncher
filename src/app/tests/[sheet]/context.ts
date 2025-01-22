import { createContext } from "react";

import { Answer, Question, Sheet } from "@models";

interface TestSheetContextType {
    attemptedAlready: boolean;
    currentAnswer: string;
    expectedAnswer: Answer | null;
    lastQuestions: number[];
    nextQuestion: Question;
    pending: boolean;
    question: Question;
    setCurrentAnswer: (value: string) => void;
    setExpectedAnswer: (value: Answer | null) => void;
    setLastQuestions: (value: number[]) => void;
    setNextQuestion: (value: Question) => void;
    setPending: (value: boolean) => void;
    setQuestion: (value: Question) => void;
    setShowMessageToFinish: (value: boolean) => void;
    sheet: Sheet;
    showMessageToFinish: boolean;
}

const testSheetContext = createContext<TestSheetContextType | undefined>(
    undefined,
);
export default testSheetContext;
