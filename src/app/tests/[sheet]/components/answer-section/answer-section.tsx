import { useContext, useEffect, useRef } from "react";

import testSheetContext from "../../context";
import styles from "./answer-section.module.css";

interface AnswerSectionProps {
    submitAnswer: (submittedAnswer: string) => void;
}

export default function AnswerSection({ submitAnswer }: AnswerSectionProps) {
    const { currentAnswer, pending, setCurrentAnswer } =
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
