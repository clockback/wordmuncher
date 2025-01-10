"use client";

import { NextResponse } from "next/server";
import { useEffect, useRef, useState } from "react";
import { JSX } from "react";

import { Question, Sheet } from "@models";

import Correct from "../../assets/images/correct.svg";
import Incomplete from "../../assets/images/incomplete.svg";
import Incorrect from "../../assets/images/incorrect.svg";
import Star from "../star/star";
import styles from "./test-question.module.css";

interface TestQuestionProps {
    sheet: Sheet;
    initialQuestion: Question;
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

function progressBar(question: Question): JSX.Element[] {
    const bars = [];
    let i = 0;
    for (; i < question.result.current; i++) {
        bars.push(<Correct key={i}></Correct>);
    }

    if (question.result.goal === 2) {
        for (; i < question.result.goal; i++) {
            bars.push(<Incomplete key={i}></Incomplete>);
        }
    } else {
        for (; i < question.result.goal; i++) {
            bars.push(<Incorrect key={i}></Incorrect>);
        }
    }

    return bars;
}

export default function TestQuestion({
    sheet,
    initialQuestion,
}: TestQuestionProps) {
    const [question, setQuestion] = useState(initialQuestion);
    const [lastQuestions, setLastQuestions] = useState([]);
    const [pending, setPending] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState("");

    const textareaRef = useRef(null);
    useEffect(() => {
        if (!pending) {
            textareaRef.current.focus();
        }
    });

    function checkHitEnterHandleResponse(response: NextResponse) {
        if (response.status !== 202) {
            console.log("Failed to submit answer!");
            return;
        }
        response.json().then((contents) => {
            setPending(false);
            setLastQuestions(contents.lastQuestions);
            setQuestion(contents.nextQuestion);
            setCurrentAnswer("");
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
            <div className={styles.progressbar}>{progressBar(question)}</div>
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
