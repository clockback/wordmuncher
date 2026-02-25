import { useContext, useEffect } from "react";

import { speak } from "@components/tts/speak";

import testSheetContext from "../../context";
import styles from "./correct-answer.module.css";

export default function CorrectAnswer() {
    const {
        expectedAnswer,
        attemptedAlready,
        question,
        speechEnabled,
        tongueLanguageCodes,
    } = useContext(testSheetContext);

    useEffect(() => {
        if (
            speechEnabled &&
            expectedAnswer !== null &&
            !attemptedAlready &&
            !question.isStudyingLanguage &&
            question.inflectionTypeId === null
        ) {
            // Question is in native language, so the answer is in the studying language.
            speak(expectedAnswer, tongueLanguageCodes.studying);
        }
    }, [
        expectedAnswer,
        attemptedAlready,
        question.inflectionTypeId,
        question.isStudyingLanguage,
        speechEnabled,
        tongueLanguageCodes.studying,
    ]);

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
            <span className={styles.correctanswervalue}>{expectedAnswer}</span>
        </div>
    );
}
