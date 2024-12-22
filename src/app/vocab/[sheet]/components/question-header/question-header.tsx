import { useContext, useState } from "react";

import editSheetContext from "../../context";
import styles from "./question-header.module.css";

export default function QuestionHeader() {
    const {
        allQuestions,
        answerEntryValue,
        isEditingQuestionText,
        proposedQuestionText,
        selectedQuestion,
        setSavePossible,
        setIsEditingQuestionText,
        setProposedQuestionText,
        setQuestionFormValid,
    } = useContext(editSheetContext);

    const [inputText, setInputText] = useState("");

    if (!isEditingQuestionText) {
        const editQuestion = () => {
            setInputText(proposedQuestionText);
            setIsEditingQuestionText(true);
        };

        return (
            <h1 className={styles.questionheader} onClick={editQuestion}>
                {proposedQuestionText}
            </h1>
        );
    }

    function preventFormSubmission(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.code == "Enter") {
            e.preventDefault();
            onBlur();
        }
    }

    const onChangeQuestionText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
    };

    const onBlur = () => {
        setIsEditingQuestionText(false);
        const questionText = inputText.trim();
        if (questionText.length == 0) {
            return;
        }

        if (questionText == selectedQuestion.questionText) {
            setProposedQuestionText(questionText);
            return;
        }

        for (let question of allQuestions) {
            if (question.questionText == questionText) {
                return;
            }
        }

        setQuestionFormValid(
            proposedQuestionText.length > 0 && answerEntryValue.length > 0,
        );
        setProposedQuestionText(questionText);
        setSavePossible(true);
    };

    return (
        <h1 className={styles.questionheader}>
            <input
                autoFocus
                className={styles.questioninput}
                onChange={onChangeQuestionText}
                onBlur={onBlur}
                onKeyDown={preventFormSubmission}
                value={inputText}
            ></input>
        </h1>
    );
}
