import { JSX, useContext } from "react";

import Button from "@components/button/button";

import testSheetContext from "../../context";
import styles from "./advance-buttons.module.css";

export default function AdvanceButtons() {
    const {
        currentAnswer,
        expectedAnswer,
        nextQuestion,
        numberOfQuestions,
        pending,
        questionNumber,
        setCurrentAnswer,
        setExpectedAnswer,
        setNextQuestion,
        setPending,
        setQuestion,
        setQuestionNumber,
        setShowMessageToFinish,
        setShowResults,
        showMessageToFinish,
        showResults,
        submitAnswer,
    } = useContext(testSheetContext);

    function prepareNewAnswer() {
        setPending(false);
        setQuestion(nextQuestion);
        setCurrentAnswer("");
        setExpectedAnswer(null);
        setNextQuestion(null);
        setQuestionNumber(questionNumber + 1);
    }

    function finishTest() {
        setShowResults(true);
    }

    let button: JSX.Element;
    if (showResults) {
        button = <Button href="/tests">Back to tests</Button>;
    } else if (questionNumber === numberOfQuestions) {
        button = <Button onClick={finishTest}>Finish</Button>;
    } else if (showMessageToFinish) {
        const keepGoingCallback = () => {
            setShowMessageToFinish(false);
            setQuestionNumber(questionNumber + 1);
        };

        button = (
            <>
                <Button onClick={finishTest}>Finish</Button>
                <Button onClick={keepGoingCallback}>Keep going</Button>
            </>
        );
    } else if (expectedAnswer) {
        button = <Button onClick={prepareNewAnswer}>Next</Button>;
    } else {
        button = (
            <Button
                onClick={submitAnswer}
                disabled={pending || currentAnswer.length == 0}
            >
                Submit
            </Button>
        );
    }

    return <div className={styles.alignright}>{button}</div>;
}
