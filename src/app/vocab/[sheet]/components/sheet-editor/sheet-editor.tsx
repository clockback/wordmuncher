"use client";

import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import { NextResponse } from "next/server";
import { useState } from "react";

import Button from "@components/button/button";

import { Question, Sheet } from "@models";

import editSheetContext from "../../context";
import EditSheetHeader from "../edit-sheet-header/edit-sheet-header";
import QuestionEditor from "../question-editor/question-editor";
import QuestionTable from "../question-table/question-table";
import styles from "./sheet-editor.module.css";

interface SheetEditorProps {
    sheet: Sheet;
    questions: Question[];
}

export default function SheetEditor({ sheet, questions }: SheetEditorProps) {
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [answerEntryValue, setAnswerEntryValue] = useState("");
    const [pending, setPending] = useState(false);
    const [savePossible, setSavePossible] = useState(false);
    const [allQuestions, setAllQuestions] = useState(questions);
    const [proposedQuestionText, setProposedQuestionText] = useState("");
    const [isEditingQuestionText, setIsEditingQuestionText] = useState(false);
    const [questionFormValid, setQuestionFormValid] = useState(true);
    const [otherAnswers, setOtherAnswers] = useState([]);
    const [isAddingOtherAnswer, setIsAddingOtherAnswer] = useState(false);
    const [editingOtherAnswerI, setEditingOtherAnswerI] = useState(null);
    const [isAddingNewQuestion, setIsAddingNewQuestion] = useState(false);
    const sheetId = sheet.id;

    const context = {
        allQuestions,
        answerEntryValue,
        editingOtherAnswerI,
        isAddingNewQuestion,
        isAddingOtherAnswer,
        isEditingQuestionText,
        otherAnswers,
        pending,
        proposedQuestionText,
        questionFormValid,
        setAnswerEntryValue,
        savePossible,
        selectedQuestion,
        setAllQuestions,
        setEditingOtherAnswerI,
        setIsAddingNewQuestion,
        setIsAddingOtherAnswer,
        setIsEditingQuestionText,
        setOtherAnswers,
        setPending,
        setProposedQuestionText,
        setQuestionFormValid,
        setSavePossible,
        setSelectedQuestion,
        sheetId,
    };

    function deleteSheetHandleResponse(response: NextResponse) {
        if (response.status !== 200) {
            console.log("Failed to delete sheet!");
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
            <EditSheetHeader>{sheet.sheetName}</EditSheetHeader>
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
