"use client";

import { NextResponse } from "next/server";
import { JSX, useContext } from "react";

import Button from "@components/button/button";

import { Question } from "@models";

import editSheetContext from "../../context";
import OtherAnswersTable from "../other-answers-table/other-answers-table";
import QuestionHeader from "../question-header/question-header";
import styles from "./question-editor.module.css";

interface clickSaveQuestionResponseProps {
    questionId: number;
    mainAnswer: string;
    questionText: string;
}

export default function QuestionEditor() {
    const {
        allQuestions,
        answerEntryValue,
        otherAnswers,
        pending,
        proposedQuestionText,
        questionFormValid,
        setAnswerEntryValue,
        savePossible,
        selectedQuestion,
        setAllQuestions,
        setIsEditingQuestionText,
        setOtherAnswers,
        setPending,
        setQuestionFormValid,
        setSavePossible,
    } = useContext(editSheetContext);

    if (selectedQuestion === null) {
        return <></>;
    }

    let answerEntry: JSX.Element | null = null;
    const onChangeAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSavePossible(true);
        setQuestionFormValid(e.target.value.length > 0);
        setAnswerEntryValue(e.target.value);
    };
    const onBlurAnswer = () => {
        if (!otherAnswers.includes(answerEntryValue.trim())) {
            return;
        }
        const newOtherAnswers = Object.assign([], otherAnswers);
        newOtherAnswers.splice(
            newOtherAnswers.indexOf(answerEntryValue.trim()),
            1,
        );
        setOtherAnswers(newOtherAnswers);
    };

    answerEntry = (
        <input
            className={styles.answerentry}
            value={answerEntryValue}
            onChange={onChangeAnswer}
            onBlur={onBlurAnswer}
            name="main-answer"
            disabled={pending}
        ></input>
    );

    function updateQuestion(
        question: Question,
        contents: clickSaveQuestionResponseProps,
    ) {
        question.questionText = contents.questionText;
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
        setIsEditingQuestionText(false);

        const proposedMainAnswer = formData.get("main-answer") as string;
        fetch(`/vocab/update-question`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: selectedQuestion.id,
                proposedQuestionText: proposedQuestionText.trim(),
                proposedMainAnswer: proposedMainAnswer.trim(),
                proposedOtherAnswers: otherAnswers,
            }),
        }).then(clickSaveQuestionHandleResponse);
    }

    return (
        <form action={clickSaveQuestion}>
            <QuestionHeader></QuestionHeader>
            <h2>Answer</h2>
            {answerEntry}
            <h3>Other accepted answers:</h3>
            <OtherAnswersTable></OtherAnswersTable>
            <div className={styles.padsavebutton}>
                <Button
                    disabled={!savePossible || pending || !questionFormValid}
                >
                    Save question
                </Button>
            </div>
        </form>
    );
}
