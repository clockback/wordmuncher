import { createContext } from "react";

import { Question } from "@models";

interface EditSheetContextType {
    allQuestions: Question[];
    answerEntryValue: string;
    pending: boolean;
    setAnswerEntryValue: (value: string) => void;
    savePossible: boolean;
    selectedQuestion: Question;
    setAllQuestions: (value: Question[]) => void;
    setPending: (value: boolean) => void;
    setSavePossible: (value: boolean) => void;
    setSelectedQuestion: (value: Question) => void;
}

const editSheetContext = createContext<EditSheetContextType | undefined>(
    undefined,
);
export default editSheetContext;
