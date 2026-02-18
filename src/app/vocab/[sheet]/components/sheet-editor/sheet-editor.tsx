"use client";

import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { useState } from "react";

import Button from "@components/button/button";

import { InflectionType, Question, Sheet } from "@models";

import editSheetContext from "../../context";
import EditSheetHeader from "../edit-sheet-header/edit-sheet-header";
import QuestionEditor from "../question-editor/question-editor";
import QuestionTable from "../question-table/question-table";
import styles from "./sheet-editor.module.css";

interface SheetEditorProps {
    sheet: Sheet;
    questions: Question[];
    inflectionTypes: InflectionType[];
    otherSheetNames: string[];
}

export default function SheetEditor({
    sheet,
    questions,
    inflectionTypes,
    otherSheetNames,
}: SheetEditorProps) {
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
        null,
    );
    const [answerEntryValue, setAnswerEntryValue] = useState<string>("");
    const [pending, setPending] = useState<boolean>(false);
    const [savePossible, setSavePossible] = useState<boolean>(false);
    const [allQuestions, setAllQuestions] = useState<Question[]>(questions);
    const [proposedQuestionText, setProposedQuestionText] =
        useState<string>("");
    const [isEditingQuestionText, setIsEditingQuestionText] =
        useState<boolean>(false);
    const [otherAnswers, setOtherAnswers] = useState<string[]>([]);
    const [isAddingOtherAnswer, setIsAddingOtherAnswer] =
        useState<boolean>(false);
    const [editingOtherAnswerI, setEditingOtherAnswerI] = useState<
        number | null
    >(null);
    const [createInvertedEntry, setCreateInvertedEntry] =
        useState<boolean>(false);
    const [isAddingNewQuestion, setIsAddingNewQuestion] =
        useState<boolean>(false);
    const [proposedInflectionType, setProposedInflectionType] =
        useState<InflectionType | null>(null);
    const [proposedInflectionAnswers, setProposedInflectionAnswers] = useState<
        Map<string, string>
    >(new Map());

    const [sheetName, setSheetName] = useState<string>(sheet.sheetName);

    const sheetId = sheet.id;

    const context = {
        allQuestions,
        answerEntryValue,
        createInvertedEntry,
        editingOtherAnswerI,
        inflectionTypes,
        isAddingNewQuestion,
        isAddingOtherAnswer,
        isEditingQuestionText,
        otherAnswers,
        pending,
        proposedInflectionAnswers,
        proposedInflectionType,
        proposedQuestionText,
        setAnswerEntryValue,
        setCreateInvertedEntry,
        savePossible,
        selectedQuestion,
        setAllQuestions,
        setEditingOtherAnswerI,
        setIsAddingNewQuestion,
        setIsAddingOtherAnswer,
        setIsEditingQuestionText,
        setOtherAnswers,
        setPending,
        setProposedInflectionAnswers,
        setProposedInflectionType,
        setProposedQuestionText,
        setSavePossible,
        setSelectedQuestion,
        setSheetName,
        sheetId,
        sheetName,
    };

    function deleteSheetHandleResponse(response: NextResponse) {
        if (!response.ok) {
            console.error("Failed to delete sheet!");
        }
        redirect("/vocab");
    }

    function deleteSheet() {
        setPending(true);
        fetch(`/vocab/${sheet.id}/delete-sheet`, { method: "DELETE" }).then(
            deleteSheetHandleResponse,
        );
    }

    return (
        <editSheetContext.Provider value={context}>
            <EditSheetHeader
                sheetId={sheet.id}
                otherSheetNames={otherSheetNames}
            />
            <div className={styles.allcolumns}>
                <div className={styles.lefthalf}>
                    <div className={styles.pad}>
                        <QuestionTable></QuestionTable>
                    </div>
                </div>
                <div className={styles.righthalf}>
                    <div className={styles.pad}>
                        <QuestionEditor></QuestionEditor>
                    </div>
                </div>
            </div>
            <div className={styles.bottombuttons}>
                <div className={styles.alignbuttons}>
                    <Button onClick={deleteSheet}>Delete</Button>
                    <Button href="/vocab">Back</Button>
                </div>
            </div>
        </editSheetContext.Provider>
    );
}
