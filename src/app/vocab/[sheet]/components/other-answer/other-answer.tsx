import { useContext, useState } from "react";

import editSheetContext from "../../context";
import styles from "./other-answer.module.css";

interface EditOtherAnswerProps {
    answerI: number;
    answer: string;
}

export default function EditOtherAnswer({
    answerI,
    answer,
}: EditOtherAnswerProps) {
    const {
        answerEntryValue,
        editingOtherAnswerI,
        otherAnswers,
        setAnswerEntryValue,
        setEditingOtherAnswerI,
        setOtherAnswers,
        setSavePossible,
    } = useContext(editSheetContext);

    const [currentOtherAnswer, setCurrentOtherAnswer] = useState("");

    function preventFormSubmission(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.code == "Enter") {
            e.preventDefault();
            blurEditOtherAnswer();
        }
    }

    const clickEditOtherAnswer = () => {
        setEditingOtherAnswerI(answerI);
        setCurrentOtherAnswer(answer);
    };

    const changeCurrentOtherAnswer = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setCurrentOtherAnswer(e.target.value);
    };

    const blurEditOtherAnswer = () => {
        if (
            currentOtherAnswer.trim().length > 0 &&
            !otherAnswers.includes(currentOtherAnswer.trim())
        ) {
            const newOtherAnswers: string[] = Object.assign([], otherAnswers);
            newOtherAnswers[answerI] = currentOtherAnswer.trim();
            setOtherAnswers(newOtherAnswers);
            setSavePossible(true);
        }
        setEditingOtherAnswerI(null);
        setCurrentOtherAnswer("");
    };

    let rowContents;
    if (answerI != editingOtherAnswerI) {
        const promote = () => {
            const newOtherAnswers: string[] = Object.assign([], otherAnswers);
            newOtherAnswers[answerI] = answerEntryValue;

            setOtherAnswers(newOtherAnswers);
            setAnswerEntryValue(answer);
            setSavePossible(true);
        };

        rowContents = (
            <>
                <td
                    className={styles.otheranswer}
                    onClick={clickEditOtherAnswer}
                >
                    {answer}
                </td>
                <td
                    className={styles.promoteanswer}
                    title="Promote to main answer"
                    onClick={promote}
                >
                    ⤴
                </td>
            </>
        );
    } else {
        rowContents = (
            <td className={styles.otheranswerinputrow} colSpan={2}>
                <input
                    className={styles.otheranswerinput}
                    onBlur={blurEditOtherAnswer}
                    value={currentOtherAnswer}
                    onChange={changeCurrentOtherAnswer}
                    onKeyDown={preventFormSubmission}
                    autoFocus
                ></input>
            </td>
        );
    }

    return <tr>{rowContents}</tr>;
}
