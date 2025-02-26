"use client";

import AdvanceButtons from "../advance-buttons/advance-buttons";
import CorrectAnswer from "../correct-answer/correct-answer";
import styles from "./test-footer.module.css";

export default function TestQuestion() {
    return (
        <div className={styles.footer}>
            <CorrectAnswer></CorrectAnswer>
            <AdvanceButtons></AdvanceButtons>
        </div>
    );
}
