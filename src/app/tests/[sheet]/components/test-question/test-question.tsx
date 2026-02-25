"use client";

import { useContext, useEffect } from "react";
import { JSX } from "react";

import { speak } from "@components/tts/speak";

import { Question, Result } from "@models";

import Correct from "../../assets/images/correct.svg";
import Incomplete from "../../assets/images/incomplete.svg";
import Incorrect from "../../assets/images/incorrect.svg";
import testSheetContext from "../../context";
import AnswerSection from "../answer-section/answer-section";
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

export default function TestQuestion() {
    const { question, speechEnabled, tongueLanguageCodes } =
        useContext(testSheetContext);

    useEffect(() => {
        if (speechEnabled && question.isStudyingLanguage) {
            speak(question.questionText, tongueLanguageCodes.studying);
        }
    }, [
        question.id,
        question.isStudyingLanguage,
        question.questionText,
        speechEnabled,
        tongueLanguageCodes.studying,
    ]);

    return (
        <>
            <div className={styles.question}>{question.questionText}</div>
            <div className={styles.starbox}>{allStars(question)}</div>
            <div className={styles.progressbar}>
                {progressBar(question.result)}
            </div>
            <AnswerSection></AnswerSection>
        </>
    );
}
