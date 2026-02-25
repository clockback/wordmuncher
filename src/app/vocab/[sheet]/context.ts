import { SetStateAction, createContext } from "react";
import { Dispatch } from "react";

import { InflectionType, Question } from "@models";

export interface TongueInfo {
    id: number;
    tongueName: string;
    flag: string;
    languageCode: string | null;
}

interface EditSheetContextType {
    allQuestions: Question[];
    answerEntryValue: string;
    createInvertedEntry: boolean;
    editingOtherAnswerI: number | null;
    inflectionTypes: InflectionType[];
    isAddingNewQuestion: boolean;
    isAddingOtherAnswer: boolean;
    isEditingQuestionText: boolean;
    isStudyingLanguage: boolean;
    nativeTongue: TongueInfo;
    otherAnswers: string[];
    pending: boolean;
    proposedInflectionAnswers: Map<string, string>;
    proposedInflectionType: InflectionType | null;
    proposedQuestionText: string;
    setAnswerEntryValue: Dispatch<SetStateAction<string>>;
    setCreateInvertedEntry: Dispatch<SetStateAction<boolean>>;
    setIsStudyingLanguage: Dispatch<SetStateAction<boolean>>;
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
    setSheetName: Dispatch<SetStateAction<string>>;
    ignoreDiacritics: boolean;
    sheetId: number;
    sheetName: string;
    studyingTongue: TongueInfo;
}

const editSheetContext = createContext<EditSheetContextType | undefined>(
    undefined,
);
export default editSheetContext;
