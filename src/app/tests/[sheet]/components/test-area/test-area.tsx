"use client";

import { NextResponse } from "next/server";
import { JSX, useState } from "react";

import { Question, Sheet } from "@models";

import testSheetContext from "../../context";
import {
    SubmitAnswerRequestAPI,
    SubmitAnswerResponseAPI,
    SubmitAnswerResponseAPICorrectOrIncorrect,
} from "../../submit-answer/api";
import TestFooter from "../test-footer/test-footer";
import TestQuestion from "../test-question/test-question";
import TestResults from "../test-results/test-results";
import styles from "./test-area.module.css";

function defaultInflectionAnswers(
    initialQuestion: Question,
): Map<string, string> {
    const inflectionAnswers = new Map<string, string>();
    for (const answer of initialQuestion.inflectionAnswers) {
        const key =
            answer.secondaryFeatureId === null
                ? answer.primaryFeatureId.toString()
                : `${answer.primaryFeatureId},${answer.secondaryFeatureId}`;

        inflectionAnswers.set(key, "");
    }
    return inflectionAnswers;
}

interface TestAreaProps {
    initialQuestion: Question;
    sheet: Sheet;
    numberOfQuestions: number | null;
    startingNumberOfStars: number;
}

export default function TestArea({
    initialQuestion,
    sheet,
    numberOfQuestions,
    startingNumberOfStars,
}: TestAreaProps) {
    const [question, setQuestion] = useState<Question>(initialQuestion);
    const [expectedAnswer, setExpectedAnswer] = useState<string | null>(null);
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
    const [inflectionAnswers, setInflectionAnswers] = useState<
        Map<string, string>
    >(defaultInflectionAnswers(initialQuestion));

    function prepareNewAnswer(
        contents: SubmitAnswerResponseAPICorrectOrIncorrect,
    ) {
        setPending(false);
        if (contents.nextQuestion !== null) {
            const newInflectionAnswers = new Map<string, string>();
            for (const answer of contents.nextQuestion.inflectionAnswers) {
                let featureKey: string;
                if (answer.secondaryFeatureId === null) {
                    featureKey = answer.primaryFeatureId.toString();
                } else {
                    featureKey = `${answer.primaryFeatureId},${answer.secondaryFeatureId}`;
                }
                newInflectionAnswers.set(featureKey, "");
            }
            setInflectionAnswers(newInflectionAnswers);
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

    function markAnswer(
        responseJSON: SubmitAnswerResponseAPICorrectOrIncorrect,
    ) {
        setNumberOfStars(responseJSON.totalStars);
        if (responseJSON.correct && questionNumber === numberOfQuestions) {
            setNumberCorrect(numberCorrect + 1);
            setTimeout(() => setShowResults(true), 1000);
            return;
        }

        setAttemptedAlready(responseJSON.reattemptAvailable);
        const newQuestion = structuredClone(question);
        newQuestion.result = responseJSON.result;
        setQuestion(newQuestion);
        setLastQuestions(responseJSON.lastQuestions);
        setExpectedAnswer(responseJSON.expectedAnswer);

        if (responseJSON.correct) {
            setNumberCorrect(numberCorrect + 1);
            setTimeout(() => prepareNewAnswer(responseJSON), 1000);
        } else {
            setNumberIncorrect(numberIncorrect + 1);
            setPromptOnCompletion(true);
            if (responseJSON.nextQuestion !== null) {
                setNextQuestion(responseJSON.nextQuestion);
            }
        }
    }

    const submitAnswerHandleResponse = async (response: NextResponse) => {
        if (!response.ok) {
            console.error("Failed to submit answer!");
            return;
        }

        const responseJSON: SubmitAnswerResponseAPI = await response.json();

        if (responseJSON.reattemptAvailable) {
            allowReattempt();
        } else {
            markAnswer(
                responseJSON as SubmitAnswerResponseAPICorrectOrIncorrect,
            );
        }
    };

    const submitAnswer = () => {
        const submitAnswer =
            question.inflectionTypeId === null ? currentAnswer.trim() : null;

        const submitInflectionAnswers =
            question.inflectionTypeId === null
                ? null
                : Object.fromEntries(inflectionAnswers);

        setPending(true);
        const retrieveNextAnswer =
            numberOfQuestions === null || questionNumber < numberOfQuestions;
        const body: SubmitAnswerRequestAPI = {
            questionId: question.id,
            submittedAnswer: submitAnswer,
            submittedInflectionAnswers: submitInflectionAnswers,
            lastQuestions: lastQuestions,
            attemptedAlready: attemptedAlready,
            retrieveNextAnswer,
        };
        fetch(`/tests/${sheet.id}/submit-answer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
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
        testAreaContents = <TestQuestion></TestQuestion>;
    }

    const context = {
        attemptedAlready,
        currentAnswer,
        expectedAnswer,
        inflectionAnswers,
        lastQuestions,
        nextQuestion,
        numberCorrect,
        numberIncorrect,
        numberOfQuestions,
        numberOfStars,
        pending,
        question,
        questionNumber,
        setInflectionAnswers,
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
        submitAnswer,
    };
    return (
        <testSheetContext.Provider value={context}>
            {progressHeader}
            <div className={styles.centre}>
                <div className={styles.verticalcentre}>{testAreaContents}</div>
            </div>
            <TestFooter></TestFooter>
        </testSheetContext.Provider>
    );
}
