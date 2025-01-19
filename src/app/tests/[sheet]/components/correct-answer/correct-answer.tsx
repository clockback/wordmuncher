import { useContext } from "react";

import testSheetContext from "../../context";
import styles from "./correct-answer.module.css";

export default function CorrectAnswer() {
    const { expectedAnswer, attemptedAlready } = useContext(testSheetContext);

    if (attemptedAlready) {
        return (
            <div className={styles.correctanswer}>
                <span className={styles.correctanswerlabel}>
                    Close, but try again!
                </span>
            </div>
        );
    }

    if (expectedAnswer === null) {
        return <></>;
    }

    return (
        <div className={styles.correctanswer}>
            <span className={styles.correctanswerlabel}>Correct answer:</span>
            <span className={styles.correctanswervalue}>
                {expectedAnswer.answerText}
            </span>
        </div>
    );
}
