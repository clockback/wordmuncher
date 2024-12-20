import { useContext, useState } from "react";

import { Question } from "@models";

import editSheetContext from "../../context";
import styles from "./question-header.module.css";

function questionAlreadyExists(questionText: string, allQuestions: Question[]) {
    for (let question of allQuestions) {
        if (question.questionText == questionText) {
            return true;
        }
    }
    return false;
}

export default function QuestionHeader() {
    const {
        allQuestions,
        answerEntryValue,
        isAddingNewQuestion,
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

    const onBlurIsAddingNewQuestion = () => {
        const questionText = inputText.trim();

        const alreadyExists = questionAlreadyExists(questionText, allQuestions);

        if (
            (questionText.length > 0 && !alreadyExists) ||
            proposedQuestionText.length > 0
        ) {
            setIsEditingQuestionText(false);
        }

        if (questionText.length == 0 || alreadyExists) {
            return;
        }

        setQuestionFormValid(
            proposedQuestionText.length > 0 && answerEntryValue.length > 0,
        );
        setProposedQuestionText(questionText);
        setSavePossible(true);
    };

    const onBlurIsEditingQuestion = () => {
        setIsEditingQuestionText(false);
        const questionText = inputText.trim();
        if (questionText.length == 0) {
            return;
        }

        if (questionText == selectedQuestion.questionText) {
            setProposedQuestionText(questionText);
            return;
        }

        if (questionAlreadyExists(questionText, allQuestions)) {
            return;
        }

        setQuestionFormValid(
            proposedQuestionText.length > 0 && answerEntryValue.length > 0,
        );
        setProposedQuestionText(questionText);
        setSavePossible(true);
    };

    const onBlur = () => {
        if (isAddingNewQuestion) {
            onBlurIsAddingNewQuestion();
        } else {
            onBlurIsEditingQuestion();
        }
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
