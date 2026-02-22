export interface ExportInflectionCategory {
    categoryName: string;
    features: string[];
}

export interface ExportInflectionType {
    typeName: string;
    primaryCategory: ExportInflectionCategory;
    secondaryCategory?: ExportInflectionCategory;
}

export interface ExportInflectionAnswer {
    primaryFeature: string;
    secondaryFeature?: string;
    answerText: string;
}

export interface ExportQuestionSimple {
    questionText: string;
    mainAnswer: string;
    otherAnswers: string[];
}

export interface ExportQuestionInflection {
    questionText: string;
    inflectionType: string;
    inflectionAnswers: ExportInflectionAnswer[];
}

export type ExportQuestion = ExportQuestionSimple | ExportQuestionInflection;

export interface ExportSheetJSON {
    sheetName: string;
    nativeTongue: string;
    studyingTongue: string;
    inflectionTypes: ExportInflectionType[];
    questions: ExportQuestion[];
}
