import { FormEventHandler, useContext, useState } from "react";

import editSheetContext from "../../context";
import styles from "./add-other-answer.module.css";

export default function AddOtherAnswer() {
    const {
        isAddingOtherAnswer,
        otherAnswers,
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
        setIsAddingOtherAnswer(false);

        if (
            currentOtherAnswer.trim().length == 0 ||
            otherAnswers.includes(currentOtherAnswer.trim())
        ) {
            return;
        }

        const newOtherAnswers: string[] = Object.assign([], otherAnswers);
        newOtherAnswers.push(currentOtherAnswer.trim());
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
