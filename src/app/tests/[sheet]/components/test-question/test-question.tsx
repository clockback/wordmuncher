"use client";

import { NextResponse } from "next/server";
import { useContext, useEffect, useRef, useState } from "react";
import { JSX } from "react";

import { Answer, Question, Result } from "@models";

import Correct from "../../assets/images/correct.svg";
import Incomplete from "../../assets/images/incomplete.svg";
import Incorrect from "../../assets/images/incorrect.svg";
import testSheetContext from "../../context";
import Star from "../star/star";
import styles from "./test-question.module.css";

interface SubmitAnswerContents {
    correct: boolean;
    result: Result;
    nextQuestion: Question;
    lastQuestions: number[];
    expectedAnswer: Answer | null;
}

function allStars(question: Question): JSX.Element[] {
    const stars = [];
    let i = 0;
    for (; i < question.result.stars; i++) {
        stars.push(<Star key={i}></Star>);
    }
    if (question.result.current == question.result.goal) {
        stars.push(<Star key={i}></Star>);
    }
    return stars;
}

function progressBar(result: Result): JSX.Element[] {
    const bars = [];
    let i = 0;
    for (; i < result.current; i++) {
        bars.push(<Correct key={i}></Correct>);
    }

    if (result.goal === 2) {
        for (; i < result.goal; i++) {
            bars.push(<Incomplete key={i}></Incomplete>);
        }
    } else {
        for (; i < result.goal; i++) {
            bars.push(<Incorrect key={i}></Incorrect>);
        }
    }

    return bars;
}

export default function TestQuestion() {
    const [lastQuestions, setLastQuestions] = useState([]);
    const [pending, setPending] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState("");

    const { question, setExpectedAnswer, setQuestion, sheet } =
        useContext(testSheetContext);

    const textareaRef = useRef(null);
    useEffect(() => {
        if (!pending) {
            textareaRef.current.focus();
        }
    });

    function setNewAnswer(contents: SubmitAnswerContents) {
        setPending(false);
        setQuestion(contents.nextQuestion);
        setCurrentAnswer("");
        setExpectedAnswer(null);
    }

    function checkHitEnterHandleResponse(response: NextResponse) {
        if (response.status !== 202) {
            console.log("Failed to submit answer!");
            return;
        }
        response.json().then((contents: SubmitAnswerContents) => {
            const newQuestion = structuredClone(question);
            newQuestion.result = contents.result;
            setQuestion(newQuestion);
            setLastQuestions(contents.lastQuestions);
            setExpectedAnswer(contents.expectedAnswer);
            setTimeout(() => setNewAnswer(contents), 1000);
        });
    }

    const hitEnter = (submittedAnswer: string) => {
        if (submittedAnswer === "") {
            return;
        }

        setPending(true);
        fetch(`/tests/${sheet.id}/submit-answer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                questionId: question.id,
                submittedAnswer: submittedAnswer,
                lastQuestions: lastQuestions,
            }),
        }).then(checkHitEnterHandleResponse);
    };

    const checkHitEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key !== "Enter") {
            return;
        }
        e.preventDefault();
        const submittedAnswer = e.currentTarget.value.trim();
        hitEnter(submittedAnswer);
    };

    const onChangeCurrentAnswer = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setCurrentAnswer(e.target.value);
    };

    return (
        <>
            <div className={styles.question}>{question.questionText}</div>
            <div className={styles.starbox}>{allStars(question)}</div>
            <div className={styles.progressbar}>
                {progressBar(question.result)}
            </div>
            <textarea
                className={styles.answerbox}
                onKeyDown={checkHitEnter}
                disabled={pending}
                value={currentAnswer}
                onChange={onChangeCurrentAnswer}
                ref={textareaRef}
            ></textarea>
        </>
    );
}
