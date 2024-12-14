"use client";

import { useState } from "react";

import Button from "@components/button/button";

import EditSheetHeader from "../edit-sheet-header/edit-sheet-header";
import QuestionEditor from "../question-editor/question-editor";
import QuestionTable from "../question-table/question-table";
import styles from "./sheet-editor.module.css";

interface QuestionJSONProps {
    questionText: string;
    id: number;
    answers: { id: number; answerText: string; isMainAnswer: boolean }[];
}

interface SheetEditorProps {
    sheet: { sheetName: string };
    questions: QuestionJSONProps[];
}

export default function SheetEditor({ sheet, questions }: SheetEditorProps) {
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [answerEntryValue, setAnswerEntryValue] = useState("");

    async function selectQuestion(question: QuestionJSONProps) {
        setSelectedQuestion(question);

        let mainAnswer: string | null = null;
        for (let answer of question.answers) {
            if (answer.isMainAnswer) {
                mainAnswer = answer.answerText;
                break;
            }
        }
        if (mainAnswer !== null) {
            setAnswerEntryValue(mainAnswer);
        }
    }

    return (
        <>
            <EditSheetHeader>{sheet.sheetName}</EditSheetHeader>
            <div className={styles.allcolumns}>
                <div className={styles.lefthalf}>
                    <div className={styles.pad}>
                        <QuestionTable
                            allQuestions={questions}
                            onClickQuestion={selectQuestion}
                        ></QuestionTable>
                    </div>
                </div>
                <div className={styles.righthalf}>
                    <div className={styles.pad}>
                        <QuestionEditor
                            question={selectedQuestion}
                            answerEntryValue={answerEntryValue}
                            setAnswerEntryValue={setAnswerEntryValue}
                        ></QuestionEditor>
                    </div>
                </div>
            </div>
            <div className={styles.bottombuttons}>
                <div className={styles.alignbuttons}>
                    <Button>Delete</Button>
                    <Button href="/vocab">Back</Button>
                </div>
            </div>
        </>
    );
}
