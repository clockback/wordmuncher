"use client";

import { useContext, useEffect, useRef } from "react";
import { JSX } from "react";

import { Question, Result } from "@models";

import Correct from "../../assets/images/correct.svg";
import Incomplete from "../../assets/images/incomplete.svg";
import Incorrect from "../../assets/images/incorrect.svg";
import testSheetContext from "../../context";
import Star from "../star/star";
import styles from "./test-question.module.css";

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

interface TestQuestionProps {
    submitAnswer: (submittedAnswer: string) => void;
}

export default function TestQuestion({ submitAnswer }: TestQuestionProps) {
    const { currentAnswer, pending, question, setCurrentAnswer } =
        useContext(testSheetContext);

    const textareaRef = useRef(null);
    useEffect(() => {
        if (!pending) {
            textareaRef.current.focus();
        }
    });

    const checkHitEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key !== "Enter") {
            return;
        }
        e.preventDefault();
        submitAnswer(e.currentTarget.value);
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
