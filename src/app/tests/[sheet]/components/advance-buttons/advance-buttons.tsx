import { JSX, useContext } from "react";

import Button from "@components/button/button";

import { leftUnanswered } from "../../client-helpers";
import testSheetContext from "../../context";
import styles from "./advance-buttons.module.css";

export default function AdvanceButtons() {
    const {
        currentAnswer,
        inflectionAnswers,
        nextQuestion,
        numberOfQuestions,
        pending,
        questionNumber,
        setCurrentAnswer,
        setExpectedAnswer,
        setInflectionAnswers,
        setInflectionCorrections,
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
        const newInflectionAnswers = new Map<string, string>();
        for (const answer of nextQuestion.inflectionAnswers) {
            let featureKey: string;
            if (answer.secondaryFeatureId === null) {
                featureKey = answer.primaryFeatureId.toString();
            } else {
                featureKey = `${answer.primaryFeatureId},${answer.secondaryFeatureId}`;
            }
            newInflectionAnswers.set(featureKey, "");
        }
        setInflectionCorrections(new Map());
        setInflectionAnswers(newInflectionAnswers);
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
    } else if (nextQuestion !== null) {
        button = <Button onClick={prepareNewAnswer}>Next</Button>;
    } else {
        let shouldDisable: boolean;
        if (
            pending ||
            (currentAnswer.length === 0 && leftUnanswered(inflectionAnswers))
        ) {
            shouldDisable = true;
        } else {
            shouldDisable = false;
        }
        button = (
            <Button onClick={submitAnswer} disabled={shouldDisable}>
                Submit
            </Button>
        );
    }

    return <div className={styles.alignright}>{button}</div>;
}
