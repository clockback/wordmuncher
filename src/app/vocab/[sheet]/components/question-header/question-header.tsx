import { useContext } from "react";

import editSheetContext from "../../context";
import styles from "./question-header.module.css";

export default function QuestionHeader() {
    const {
        isEditingQuestionText,
        proposedQuestionText,
        setSavePossible,
        setIsEditingQuestionText,
        setProposedQuestionText,
        setQuestionFormValid,
    } = useContext(editSheetContext);

    if (!isEditingQuestionText) {
        const editQuestion = () => {
            setIsEditingQuestionText(true);
        };

        return (
            <h1 className={styles.questionheader} onClick={editQuestion}>
                {proposedQuestionText}
            </h1>
        );
    }

    const onChangeQuestionText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProposedQuestionText(e.target.value);
        setQuestionFormValid(e.target.value.length > 0);
        setSavePossible(true);
    };

    const onBlur = () => {
        setIsEditingQuestionText(false);
    };

    return (
        <h1 className={styles.questionheader}>
            <input
                autoFocus
                className={styles.questioninput}
                onChange={onChangeQuestionText}
                onBlur={onBlur}
                value={proposedQuestionText}
            ></input>
        </h1>
    );
}
