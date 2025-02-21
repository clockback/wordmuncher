import { SetStateAction, createContext } from "react";
import { Dispatch } from "react";

import { InflectionType, Question } from "@models";

interface EditSheetContextType {
    allQuestions: Question[];
    answerEntryValue: string;
    editingOtherAnswerI: number | null;
    inflectionTypes: InflectionType[];
    isAddingNewQuestion: boolean;
    isAddingOtherAnswer: boolean;
    isEditingQuestionText: boolean;
    otherAnswers: string[];
    pending: boolean;
    proposedInflectionAnswers: Map<string, string>;
    proposedInflectionType: InflectionType | null;
    proposedQuestionText: string;
    setAnswerEntryValue: Dispatch<SetStateAction<string>>;
    savePossible: boolean;
    selectedQuestion: Question | null;
    setAllQuestions: Dispatch<SetStateAction<Question[]>>;
    setEditingOtherAnswerI: Dispatch<SetStateAction<number | null>>;
    setIsAddingNewQuestion: Dispatch<SetStateAction<boolean>>;
    setIsAddingOtherAnswer: Dispatch<SetStateAction<boolean>>;
    setIsEditingQuestionText: Dispatch<SetStateAction<boolean>>;
    setOtherAnswers: Dispatch<SetStateAction<string[]>>;
    setPending: Dispatch<SetStateAction<boolean>>;
    setProposedInflectionAnswers: Dispatch<SetStateAction<Map<string, string>>>;
    setProposedInflectionType: Dispatch<SetStateAction<InflectionType | null>>;
    setProposedQuestionText: Dispatch<SetStateAction<string>>;
    setSavePossible: Dispatch<SetStateAction<boolean>>;
    setSelectedQuestion: Dispatch<SetStateAction<Question | null>>;
    sheetId: number;
}

const editSheetContext = createContext<EditSheetContextType | undefined>(
    undefined,
);
export default editSheetContext;
