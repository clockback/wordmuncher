"use client";

import { JSX } from "react";

import Button from "@components/button/button";

import { Question } from "@models";

import styles from "./question-editor.module.css";

interface QuestionEditorProps {
    question: Question;
    answerEntryValue: string;
    setAnswerEntryValue: (value: string) => void;
    pending: boolean;
    clickSaveQuestion: (formData: FormData) => void;
    savePossible: boolean;
    setSavePossible: (value: boolean) => void;
}

export default function QuestionEditor({
    question,
    answerEntryValue,
    setAnswerEntryValue,
    pending,
    clickSaveQuestion,
    savePossible,
    setSavePossible,
}: QuestionEditorProps | null) {
    if (question === null) {
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

    const otherAnswerRows = [];
    for (let answer of question.answers) {
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
            <h1>{question.questionText}</h1>
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
