import { createContext } from "react";

import { Question } from "@models";

interface EditSheetContextType {
    allQuestions: Question[];
    answerEntryValue: string;
    editingOtherAnswerI: number | null;
    isAddingOtherAnswer: boolean;
    isEditingQuestionText: boolean;
    otherAnswers: string[];
    pending: boolean;
    proposedQuestionText: string;
    questionFormValid: boolean;
    setAnswerEntryValue: (value: string) => void;
    savePossible: boolean;
    selectedQuestion: Question;
    setAllQuestions: (value: Question[]) => void;
    setEditingOtherAnswerI: (value: number | null) => void;
    setIsAddingOtherAnswer: (value: boolean) => void;
    setIsEditingQuestionText: (value: boolean) => void;
    setOtherAnswers: (value: string[]) => void;
    setPending: (value: boolean) => void;
    setProposedQuestionText: (value: string) => void;
    setQuestionFormValid: (value: boolean) => void;
    setSavePossible: (value: boolean) => void;
    setSelectedQuestion: (value: Question) => void;
}

const editSheetContext = createContext<EditSheetContextType | undefined>(
    undefined,
);
export default editSheetContext;
