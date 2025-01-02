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
        isAddingNewQuestion,
        otherAnswers,
        pending,
        proposedQuestionText,
        questionFormValid,
        setAnswerEntryValue,
        savePossible,
        selectedQuestion,
        setAllQuestions,
        setIsAddingNewQuestion,
        setIsEditingQuestionText,
        setOtherAnswers,
        setPending,
        setQuestionFormValid,
        setSavePossible,
        setSelectedQuestion,
        sheetId,
    } = useContext(editSheetContext);

    if (selectedQuestion === null && !isAddingNewQuestion) {
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
            title="Main answer"
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

    function clickSaveNewQuestionHandleResponse(response: NextResponse) {
        response.json().then((contents) => {
            const updatedQuestions = structuredClone(allQuestions);
            updatedQuestions.push(contents);
            setAllQuestions(updatedQuestions);
            setSavePossible(false);
            setPending(false);
            setIsAddingNewQuestion(false);
        });
    }

    function clickSaveNewQuestion(mainAnswer: string) {
        fetch(`/vocab/${sheetId}/add-question`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sheetId: sheetId,
                proposedQuestionText: proposedQuestionText.trim(),
                proposedMainAnswer: mainAnswer,
                proposedOtherAnswers: otherAnswers,
            }),
        }).then(clickSaveNewQuestionHandleResponse);
    }

    function clickSaveEditQuestionHandleResponse(response: NextResponse) {
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

    function clickSaveEditQuestion(mainAnswer: string) {
        fetch("/vocab/update-question", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: selectedQuestion.id,
                proposedQuestionText: proposedQuestionText.trim(),
                proposedMainAnswer: mainAnswer,
                proposedOtherAnswers: otherAnswers,
            }),
        }).then(clickSaveEditQuestionHandleResponse);
    }

    function clickSaveQuestion(formData: FormData) {
        setPending(true);
        setIsEditingQuestionText(false);

        const proposedMainAnswer = formData.get("main-answer") as string;
        const mainAnswer = proposedMainAnswer.trim();

        if (isAddingNewQuestion) {
            clickSaveNewQuestion(mainAnswer);
        } else {
            clickSaveEditQuestion(mainAnswer);
        }
    }

    const clickDeleteQuestionHandleResponse = (response: NextResponse) => {
        response.json().then((contents) => {
            setPending(false);

            if (contents.error) {
                setPending(false);
                return;
            }

            const updatedQuestions = allQuestions.filter(
                (question) => question.id !== selectedQuestion.id,
            );
            setAllQuestions(updatedQuestions);
            setSelectedQuestion(null);
        });
    };

    const clickDeleteQuestion = () => {
        setPending(true);
        fetch("/vocab/delete-question", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: selectedQuestion.id }),
        }).then(clickDeleteQuestionHandleResponse);
    };

    const deleteButton = isAddingNewQuestion ? null : (
        <Button disabled={pending} onClick={clickDeleteQuestion}>
            Delete question
        </Button>
    );

    return (
        <form action={clickSaveQuestion}>
            <QuestionHeader></QuestionHeader>
            <h2>Answer</h2>
            {answerEntry}
            <h3>Other accepted answers:</h3>
            <OtherAnswersTable></OtherAnswersTable>
            <div className={styles.padsavebutton}>
                {deleteButton}
                <Button
                    disabled={!savePossible || pending || !questionFormValid}
                >
                    Save question
                </Button>
            </div>
        </form>
    );
}
