"use client";

import AdvanceButtons from "../advance-buttons/advance-buttons";
import CorrectAnswer from "../correct-answer/correct-answer";
import styles from "./test-footer.module.css";

interface TestQuestionProps {
    submitAnswer: (submittedAnswer: string) => void;
}

export default function TestQuestion({ submitAnswer }: TestQuestionProps) {
    return (
        <div className={styles.footer}>
            <CorrectAnswer></CorrectAnswer>
            <AdvanceButtons submitAnswer={submitAnswer}></AdvanceButtons>
        </div>
    );
}
