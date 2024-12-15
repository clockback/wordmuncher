"use client";

import { NextResponse } from "next/server";
import { JSX, useContext } from "react";

import Button from "@components/button/button";

import { Question } from "@models";

import editSheetContext from "../../context";
import styles from "./question-editor.module.css";

interface clickSaveQuestionResponseProps {
    questionId: number;
    mainAnswer: string;
}

export default function QuestionEditor() {
    const {
        allQuestions,
        answerEntryValue,
        pending,
        setAnswerEntryValue,
        savePossible,
        selectedQuestion,
        setAllQuestions,
        setPending,
        setSavePossible,
    } = useContext(editSheetContext);

    if (selectedQuestion === null) {
        return <></>;
    }

    let answerEntry: JSX.Element | null = null;
    const onChangeAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSavePossible(true);
        setAnswerEntryValue(e.target.value);
    };

    answerEntry = (
        <input
            className={styles.answerentry}
            value={answerEntryValue}
            onChange={onChangeAnswer}
            name="main-answer"
            disabled={pending}
        ></input>
    );

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

    function clickSaveQuestion(formData: FormData) {
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

    const otherAnswerRows = [];
    for (let answer of selectedQuestion.answers) {
        if (answer.isMainAnswer) {
            continue;
        }
        otherAnswerRows.push(
            <tr key={answer.id}>
                <td className={styles.otheranswer}>{answer.answerText}</td>
                <td
                    className={styles.promoteanswer}
                    title="Promote to main answer"
                >
                    ⤴
                </td>
            </tr>,
        );
    }

    return (
        <form action={clickSaveQuestion}>
            <h1>{selectedQuestion.questionText}</h1>
            <h2>Answer</h2>
            {answerEntry}
            <h3>Other accepted answers:</h3>
            <table className={styles.otheranswerstable}>
                <tbody>{otherAnswerRows}</tbody>
            </table>
            <div className={styles.padsavebutton}>
                <Button disabled={!savePossible || pending}>
                    Save question
                </Button>
            </div>
        </form>
    );
}
