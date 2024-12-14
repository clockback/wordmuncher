"use client";

import { JSX, useState } from "react";

import Button from "@components/button/button";

import styles from "./question-editor.module.css";

interface QuestionJSONProps {
    questionText: string;
    id: number;
    answers: { id: number; answerText: string; isMainAnswer: boolean }[];
}

interface QuestionEditorProps {
    question: QuestionJSONProps;
    answerEntryValue: string;
    setAnswerEntryValue: (value: string) => void;
}

export default function QuestionEditor({
    question,
    answerEntryValue,
    setAnswerEntryValue,
}: QuestionEditorProps | null) {
    const [savePossible, setSavePossible] = useState(false);

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
        ></input>
    );

    const otherAnswerRows = [];
    for (let answer of question.answers) {
        if (answer.isMainAnswer) {
            continue;
        }
        otherAnswerRows.push(
            <tr key={answer.id}>
                <td className={styles.otheranswer}>
                    first answer first answer first answer first answer first
                    answer first answer first answer
                </td>
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
        <form>
            <h1>{question.questionText}</h1>
            <h2>Answer</h2>
            {answerEntry}
            <h3>Other accepted answers:</h3>
            <table className={styles.otheranswerstable}>
                <tbody>{otherAnswerRows}</tbody>
            </table>
            <div className={styles.padsavebutton}>
                <Button disabled={!savePossible || true}>Save question</Button>
            </div>
        </form>
    );
}
