import { useContext, useEffect, useRef } from "react";

import testSheetContext from "../../context";
import styles from "./answer-section-text.module.css";

export default function AnswerSectionText() {
    const { currentAnswer, pending, setCurrentAnswer, submitAnswer } =
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
        submitAnswer();
    };

    const onChangeCurrentAnswer = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setCurrentAnswer(e.target.value);
    };

    return (
        <textarea
            className={styles.answerbox}
            onKeyDown={checkHitEnter}
            disabled={pending}
            value={currentAnswer}
            onChange={onChangeCurrentAnswer}
            ref={textareaRef}
        ></textarea>
    );
}
