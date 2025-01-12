import { useContext, useState } from "react";

import editSheetContext from "../../context";
import styles from "./add-other-answer.module.css";

export default function AddOtherAnswer() {
    const {
        isAddingOtherAnswer,
        otherAnswers,
        answerEntryValue,
        setIsAddingOtherAnswer,
        setOtherAnswers,
        setSavePossible,
    } = useContext(editSheetContext);

    const [currentOtherAnswer, setCurrentOtherAnswer] = useState("");

    function clickAddNewAnswer() {
        setCurrentOtherAnswer("");
        setIsAddingOtherAnswer(true);
    }

    function blurAddNewAnswer() {
        const trimmedAnswer = currentOtherAnswer.trim();
        setIsAddingOtherAnswer(false);

        if (
            trimmedAnswer.length == 0 ||
            otherAnswers.includes(trimmedAnswer) ||
            answerEntryValue.trim() == trimmedAnswer
        ) {
            return;
        }

        const newOtherAnswers: string[] = Object.assign([], otherAnswers);
        newOtherAnswers.push(trimmedAnswer);
        setOtherAnswers(newOtherAnswers);
        setSavePossible(true);
    }

    function updateNewAnswer(e: React.ChangeEvent<HTMLInputElement>) {
        setCurrentOtherAnswer(e.target.value);
    }

    function preventFormSubmission(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.code == "Enter") {
            e.preventDefault();
            blurAddNewAnswer();
        }
    }

    let rowContents = null;
    if (isAddingOtherAnswer) {
        rowContents = (
            <input
                className={styles.addotheranswerinput}
                onBlur={blurAddNewAnswer}
                autoFocus
                value={currentOtherAnswer}
                onChange={updateNewAnswer}
                onKeyDown={preventFormSubmission}
                title="Other answer"
            ></input>
        );
    } else {
        rowContents = <>Add new answer</>;
    }

    return (
        <tr>
            <td
                className={styles.addotheranswer}
                colSpan={2}
                onClick={clickAddNewAnswer}
            >
                {rowContents}
            </td>
        </tr>
    );
}
