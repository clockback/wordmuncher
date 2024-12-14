"use client";

import router from "next/router";
import { NextResponse } from "next/server";
import { useState } from "react";

import Button from "@components/button/button";

import { Question, Sheet } from "@models";

import EditSheetHeader from "../edit-sheet-header/edit-sheet-header";
import QuestionEditor from "../question-editor/question-editor";
import QuestionTable from "../question-table/question-table";
import styles from "./sheet-editor.module.css";

interface SheetEditorProps {
    sheet: Sheet;
    questions: Question[];
}

interface clickSaveQuestionResponseProps {
    questionId: number;
    mainAnswer: string;
}

export default function SheetEditor({ sheet, questions }: SheetEditorProps) {
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [answerEntryValue, setAnswerEntryValue] = useState("");
    const [pending, setPending] = useState(false);
    const [savePossible, setSavePossible] = useState(false);
    const [allQuestions, setAllQuestions] = useState(questions);

    async function selectQuestion(question: Question) {
        setSelectedQuestion(question);
        setSavePossible(false);

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

    function updateQuestion(
        question: Question,
        contents: clickSaveQuestionResponseProps,
    ) {
        for (let answer of question.answers) {
            if (answer.isMainAnswer) {
                answer.answerText = contents.mainAnswer;
            }
        }
    }

    function clickSaveQuestionHandleResponse(response: NextResponse) {
        response.json().then((contents) => {
            const questionId = contents.questionId;
            const updatedQuestions = structuredClone(allQuestions);
            for (let question of updatedQuestions) {
                if (question.id == questionId) {
                    updateQuestion(question, contents);
                }
            }
            setAllQuestions(updatedQuestions);
            setSavePossible(false);
            setPending(false);
        });
    }

    async function clickSaveQuestion(formData: FormData) {
        setPending(true);
        const proposedMainAnswer = formData.get("main-answer") as string;
        fetch(`/vocab/update-question`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: selectedQuestion.id,
                proposedMainAnswer: proposedMainAnswer.trim(),
            }),
        }).then(clickSaveQuestionHandleResponse);
    }

    return (
        <>
            <EditSheetHeader>{sheet.sheetName}</EditSheetHeader>
            <div className={styles.allcolumns}>
                <div className={styles.lefthalf}>
                    <div className={styles.pad}>
                        <QuestionTable
                            allQuestions={allQuestions}
                            onClickQuestion={selectQuestion}
                            selectedQuestionId={
                                selectedQuestion ? selectedQuestion.id : -1
                            }
                            promptSaveOnNavigate={savePossible}
                        ></QuestionTable>
                    </div>
                </div>
                <div className={styles.righthalf}>
                    <div className={styles.pad}>
                        <QuestionEditor
                            question={selectedQuestion}
                            answerEntryValue={answerEntryValue}
                            setAnswerEntryValue={setAnswerEntryValue}
                            pending={pending}
                            clickSaveQuestion={clickSaveQuestion}
                            savePossible={savePossible}
                            setSavePossible={setSavePossible}
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
