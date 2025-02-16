"use client";

import { NextResponse } from "next/server";
import { JSX, useState } from "react";

import { Answer, Question, Result, Sheet } from "@models";

import testSheetContext from "../../context";
import TestFooter from "../test-footer/test-footer";
import TestQuestion from "../test-question/test-question";
import TestResults from "../test-results/test-results";
import styles from "./test-area.module.css";

interface TestAreaProps {
    initialQuestion: Question;
    sheet: Sheet;
    numberOfQuestions: number | null;
    startingNumberOfStars: number;
}

interface SubmitAnswerContents {
    correct: boolean;
    result: Result;
    nextQuestion: Question | null;
    lastQuestions: number[];
    expectedAnswer: Answer | null;
    reattemptAvailable: boolean;
    totalStars?: number;
    done?: boolean;
}

export default function TestArea({
    initialQuestion,
    sheet,
    numberOfQuestions,
    startingNumberOfStars,
}: TestAreaProps) {
    const [question, setQuestion] = useState<Question>(initialQuestion);
    const [expectedAnswer, setExpectedAnswer] = useState<Answer | null>(null);
    const [lastQuestions, setLastQuestions] = useState<number[]>([]);
    const [pending, setPending] = useState<boolean>(false);
    const [currentAnswer, setCurrentAnswer] = useState<string>("");
    const [nextQuestion, setNextQuestion] = useState<Question | null>(null);
    const [attemptedAlready, setAttemptedAlready] = useState<boolean>(false);
    const [promptOnCompletion, setPromptOnCompletion] = useState<boolean>(true);
    const [showMessageToFinish, setShowMessageToFinish] =
        useState<boolean>(false);
    const [questionNumber, setQuestionNumber] = useState<number>(1);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [numberCorrect, setNumberCorrect] = useState<number>(0);
    const [numberIncorrect, setNumberIncorrect] = useState<number>(0);
    const [numberOfStars, setNumberOfStars] = useState<number>(0);

    function prepareNewAnswer(contents: SubmitAnswerContents) {
        setPending(false);
        if (contents.nextQuestion !== null) {
            setQuestion(contents.nextQuestion);
        }
        setCurrentAnswer("");
        setExpectedAnswer(null);
        setNextQuestion(null);
        if (contents.done && promptOnCompletion) {
            setShowMessageToFinish(true);
            setPromptOnCompletion(false);
        } else {
            setQuestionNumber(questionNumber + 1);
        }
    }

    function allowReattempt() {
        setAttemptedAlready(true);
        setPending(false);
    }

    function markAnswer(contents: SubmitAnswerContents) {
        setNumberOfStars(contents.totalStars);
        if (contents.correct && questionNumber === numberOfQuestions) {
            setNumberCorrect(numberCorrect + 1);
            setTimeout(() => setShowResults(true), 1000);
            return;
        }

        setAttemptedAlready(contents.reattemptAvailable);
        const newQuestion = structuredClone(question);
        newQuestion.result = contents.result;
        setQuestion(newQuestion);
        setLastQuestions(contents.lastQuestions);
        setExpectedAnswer(contents.correct ? null : contents.expectedAnswer);
        if (contents.correct) {
            setNumberCorrect(numberCorrect + 1);
            setTimeout(() => prepareNewAnswer(contents), 1000);
        } else {
            setNumberIncorrect(numberIncorrect + 1);
            setPromptOnCompletion(true);
            if (contents.nextQuestion !== null) {
                setNextQuestion(contents.nextQuestion);
            }
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
        const retrieveNextAnswer =
            numberOfQuestions === null || questionNumber < numberOfQuestions;
        fetch(`/tests/${sheet.id}/submit-answer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                questionId: question.id,
                submittedAnswer: trimmedAnswer,
                lastQuestions: lastQuestions,
                attemptedAlready: attemptedAlready,
                retrieveNextAnswer,
            }),
        }).then(submitAnswerHandleResponse);
    };

    let progressHeader: JSX.Element;
    if (showResults) {
        progressHeader = null;
    } else if (numberOfQuestions === null) {
        progressHeader = (
            <h2 className={styles.questionheader}>Question {questionNumber}</h2>
        );
    } else {
        progressHeader = (
            <h2 className={styles.questionheader}>
                Question {questionNumber}/{numberOfQuestions}
            </h2>
        );
    }

    let testAreaContents: JSX.Element;
    if (showResults) {
        testAreaContents = <TestResults></TestResults>;
    } else if (showMessageToFinish) {
        testAreaContents = <h1>Sheet completed!</h1>;
    } else {
        testAreaContents = (
            <TestQuestion submitAnswer={submitAnswer}></TestQuestion>
        );
    }

    const context = {
        attemptedAlready,
        currentAnswer,
        expectedAnswer,
        lastQuestions,
        nextQuestion,
        numberCorrect,
        numberIncorrect,
        numberOfQuestions,
        numberOfStars,
        pending,
        question,
        questionNumber,
        setQuestionNumber,
        setCurrentAnswer,
        setExpectedAnswer,
        setLastQuestions,
        setNextQuestion,
        setNumberCorrect,
        setNumberIncorrect,
        setPending,
        setQuestion,
        setShowMessageToFinish,
        setShowResults,
        sheet,
        showMessageToFinish,
        showResults,
        startingNumberOfStars,
    };
    return (
        <testSheetContext.Provider value={context}>
            {progressHeader}
            <div className={styles.centre}>
                <div className={styles.verticalcentre}>{testAreaContents}</div>
            </div>
            <TestFooter submitAnswer={submitAnswer}></TestFooter>
        </testSheetContext.Provider>
    );
}
