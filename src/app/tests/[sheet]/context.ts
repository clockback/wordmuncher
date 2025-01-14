import { createContext } from "react";

import { Answer, Question, Sheet } from "@models";

interface TestSheetContextType {
    expectedAnswer: Answer | null;
    question: Question;
    setExpectedAnswer: (value: Answer | null) => void;
    setQuestion: (value: Question) => void;
    sheet: Sheet;
}

const testSheetContext = createContext<TestSheetContextType | undefined>(
    undefined,
);
export default testSheetContext;
