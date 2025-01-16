import { JSX, useContext } from "react";

import Button from "@components/button/button";

import testSheetContext from "../../context";
import styles from "./advance-button.module.css";

interface AdvanceButtonProps {
    submitAnswer: (submittedAnswer: string) => void;
}

export default function AdvanceButton({ submitAnswer }: AdvanceButtonProps) {
    const {
        currentAnswer,
        expectedAnswer,
        nextQuestion,
        pending,
        setCurrentAnswer,
        setExpectedAnswer,
        setNextQuestion,
        setPending,
        setQuestion,
    } = useContext(testSheetContext);

    const curriedSubmitAnswer = () => {
        submitAnswer(currentAnswer);
    };

    function prepareNewAnswer() {
        setPending(false);
        setQuestion(nextQuestion);
        setCurrentAnswer("");
        setExpectedAnswer(null);
        setNextQuestion(null);
    }

    let button: JSX.Element;
    if (expectedAnswer) {
        button = <Button onClick={prepareNewAnswer}>Next</Button>;
    } else {
        button = (
            <Button
                onClick={curriedSubmitAnswer}
                disabled={pending || currentAnswer.length == 0}
            >
                Submit
            </Button>
        );
    }

    return <div className={styles.alignright}>{button}</div>;
}
