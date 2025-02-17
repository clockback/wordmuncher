import { JSX, useContext } from "react";

import editSheetContext from "../../context";
import OtherAnswersTable from "../other-answers-table/other-answers-table";
import styles from "./answer-section.module.css";

export default function AnswerSection() {
    const {
        answerEntryValue,
        otherAnswers,
        pending,
        setAnswerEntryValue,
        setOtherAnswers,
        setQuestionFormValid,
        setSavePossible,
    } = useContext(editSheetContext);

    let answerEntry: JSX.Element | null = null;
    const onChangeAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSavePossible(true);
        setQuestionFormValid(e.target.value.length > 0);
        setAnswerEntryValue(e.target.value);
    };
    const onBlurAnswer = () => {
        if (!otherAnswers.includes(answerEntryValue.trim())) {
            return;
        }
        const newOtherAnswers = Object.assign([], otherAnswers);
        newOtherAnswers.splice(
            newOtherAnswers.indexOf(answerEntryValue.trim()),
            1,
        );
        setOtherAnswers(newOtherAnswers);
    };

    answerEntry = (
        <input
            className={styles.answerentry}
            value={answerEntryValue}
            onChange={onChangeAnswer}
            onBlur={onBlurAnswer}
            name="main-answer"
            title="Main answer"
            disabled={pending}
        ></input>
    );

    return (
        <>
            <h2>Answer</h2>
            {answerEntry}
            <h3>Other accepted answers:</h3>
            <OtherAnswersTable></OtherAnswersTable>
        </>
    );
}
