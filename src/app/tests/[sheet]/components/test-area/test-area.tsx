"use client";

import { NextResponse } from "next/server";
import { useState } from "react";

import { Answer, Question, Result, Sheet } from "@models";

import testSheetContext from "../../context";
import TestFooter from "../test-footer/test-footer";
import TestQuestion from "../test-question/test-question";
import styles from "./test-area.module.css";

interface TestAreaProps {
    initialQuestion: Question;
    sheet: Sheet;
}

interface SubmitAnswerContents {
    correct: boolean;
    result: Result;
    nextQuestion: Question;
    lastQuestions: number[];
    expectedAnswer: Answer | null;
    reattemptAvailable: boolean;
}

export default function TestArea({ initialQuestion, sheet }: TestAreaProps) {
    const [question, setQuestion] = useState(initialQuestion);
    const [expectedAnswer, setExpectedAnswer] = useState(null);
    const [lastQuestions, setLastQuestions] = useState([]);
    const [pending, setPending] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [nextQuestion, setNextQuestion] = useState(null);
    const [attemptedAlready, setAttemptedAlready] = useState(false);

    function prepareNewAnswer(contents: SubmitAnswerContents) {
        setPending(false);
        setQuestion(contents.nextQuestion);
        setCurrentAnswer("");
        setExpectedAnswer(null);
        setNextQuestion(null);
    }

    function allowReattempt() {
        setAttemptedAlready(true);
        setPending(false);
    }

    function markAnswer(contents: SubmitAnswerContents) {
        setAttemptedAlready(contents.reattemptAvailable);
        const newQuestion = structuredClone(question);
        newQuestion.result = contents.result;
        setQuestion(newQuestion);
        setLastQuestions(contents.lastQuestions);
        setExpectedAnswer(contents.correct ? null : contents.expectedAnswer);
        if (contents.correct) {
            setTimeout(() => prepareNewAnswer(contents), 1000);
        } else {
            setNextQuestion(contents.nextQuestion);
        }
    }

    const submitAnswerHandleResponse = async (response: NextResponse) => {
        if (response.status !== 202) {
            console.log("Failed to submit answer!");
            return;
        }
        response.json().then((contents: SubmitAnswerContents) => {
            if (contents.reattemptAvailable) {
                console.log("Reattempt available!");
                allowReattempt();
            } else {
                markAnswer(contents);
            }
        });
    };

    const submitAnswer = (submittedAnswer: string) => {
        const trimmedAnswer = submittedAnswer.trim();
        if (trimmedAnswer === "") {
            return;
        }

        setPending(true);
        fetch(`/tests/${sheet.id}/submit-answer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                questionId: question.id,
                submittedAnswer: trimmedAnswer,
                lastQuestions: lastQuestions,
                attemptedAlready: attemptedAlready,
            }),
        }).then(submitAnswerHandleResponse);
    };

    const context = {
        attemptedAlready,
        currentAnswer,
        expectedAnswer,
        lastQuestions,
        nextQuestion,
        pending,
        question,
        setCurrentAnswer,
        setExpectedAnswer,
        setLastQuestions,
        setNextQuestion,
        setPending,
        setQuestion,
        sheet,
    };
    return (
        <testSheetContext.Provider value={context}>
            <div className={styles.centre}>
                <div className={styles.verticalcentre}>
                    <TestQuestion submitAnswer={submitAnswer}></TestQuestion>
                </div>
            </div>
            <TestFooter submitAnswer={submitAnswer}></TestFooter>
        </testSheetContext.Provider>
    );
}
