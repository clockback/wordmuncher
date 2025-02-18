"use client";

import { NextResponse } from "next/server";
import { useContext } from "react";

import Button from "@components/button/button";
import EditableHeader from "@components/editable-header/editable-header";

import { Question } from "@models";

import editSheetContext from "../../context";
import AnswerSection from "../answer-section/answer-section";
import styles from "./question-editor.module.css";

function questionAlreadyExists(questionText: string, allQuestions: Question[]) {
    for (const question of allQuestions) {
        if (question.questionText == questionText) {
            return true;
        }
    }
    return false;
}

interface clickSaveQuestionResponseProps {
    questionId: number;
    mainAnswer: string;
    questionText: string;
}

export default function QuestionEditor() {
    const {
        allQuestions,
        answerEntryValue,
        isAddingNewQuestion,
        isEditingQuestionText,
        otherAnswers,
        pending,
        proposedQuestionText,
        questionFormValid,
        savePossible,
        selectedQuestion,
        setAllQuestions,
        setIsAddingNewQuestion,
        setIsEditingQuestionText,
        setPending,
        setProposedQuestionText,
        setQuestionFormValid,
        setSavePossible,
        setSelectedQuestion,
        sheetId,
    } = useContext(editSheetContext);

    if (selectedQuestion === null && !isAddingNewQuestion) {
        return <></>;
    }

    function updateQuestion(
        question: Question,
        contents: clickSaveQuestionResponseProps,
    ) {
        question.questionText = contents.questionText;
        for (const answer of question.answers) {
            if (answer.isMainAnswer) {
                answer.answerText = contents.mainAnswer;
            }
        }
    }

    function clickSaveNewQuestionHandleResponse(response: NextResponse) {
        response.json().then((contents) => {
            const updatedQuestions = structuredClone(allQuestions);
            updatedQuestions.push(contents);
            setAllQuestions(updatedQuestions);
            setSavePossible(false);
            setPending(false);
            setIsAddingNewQuestion(false);
        });
    }

    function clickSaveNewQuestion(mainAnswer: string) {
        fetch(`/vocab/${sheetId}/add-question`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sheetId: sheetId,
                proposedQuestionText: proposedQuestionText.trim(),
                proposedMainAnswer: mainAnswer,
                proposedOtherAnswers: otherAnswers,
            }),
        }).then(clickSaveNewQuestionHandleResponse);
    }

    function clickSaveEditQuestionHandleResponse(response: NextResponse) {
        response.json().then((contents) => {
            const questionId = contents.questionId;
            const updatedQuestions = structuredClone(allQuestions);
            for (const question of updatedQuestions) {
                if (question.id == questionId) {
                    updateQuestion(question, contents);
                }
            }
            setAllQuestions(updatedQuestions);
            setSavePossible(false);
            setPending(false);
        });
    }

    function clickSaveEditQuestion(mainAnswer: string) {
        fetch("/vocab/update-question", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: selectedQuestion.id,
                proposedQuestionText: proposedQuestionText.trim(),
                proposedMainAnswer: mainAnswer,
                proposedOtherAnswers: otherAnswers,
            }),
        }).then(clickSaveEditQuestionHandleResponse);
    }

    function clickSaveQuestion(formData: FormData) {
        setPending(true);
        setIsEditingQuestionText(false);

        const proposedMainAnswer = formData.get("main-answer") as string;
        const mainAnswer = proposedMainAnswer.trim();

        if (isAddingNewQuestion) {
            clickSaveNewQuestion(mainAnswer);
        } else {
            clickSaveEditQuestion(mainAnswer);
        }
    }

    const clickDeleteQuestionHandleResponse = (response: NextResponse) => {
        response.json().then((contents) => {
            setPending(false);

            if (contents.error) {
                setPending(false);
                return;
            }

            const updatedQuestions = allQuestions.filter(
                (question) => question.id !== selectedQuestion.id,
            );
            setAllQuestions(updatedQuestions);
            setSelectedQuestion(null);
        });
    };

    const clickDeleteQuestion = () => {
        setPending(true);
        fetch("/vocab/delete-question", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: selectedQuestion.id }),
        }).then(clickDeleteQuestionHandleResponse);
    };

    const deleteButton = isAddingNewQuestion ? null : (
        <Button disabled={pending} onClick={clickDeleteQuestion}>
            Delete question
        </Button>
    );

    const onBlurIsAddingNewQuestion = (inputText: string) => {
        const alreadyExists = questionAlreadyExists(inputText, allQuestions);

        if (
            (inputText.length > 0 && !alreadyExists) ||
            proposedQuestionText.length > 0
        ) {
            setIsEditingQuestionText(false);
        }

        if (inputText.length == 0 || alreadyExists) {
            return;
        }

        setQuestionFormValid(
            proposedQuestionText.length > 0 && answerEntryValue.length > 0,
        );
        setProposedQuestionText(inputText);
        setSavePossible(true);
    };

    const onBlurIsEditingQuestion = (inputText: string) => {
        setIsEditingQuestionText(false);
        if (inputText.length == 0) {
            return;
        }

        if (inputText == selectedQuestion.questionText) {
            setProposedQuestionText(inputText);
            return;
        }

        if (questionAlreadyExists(inputText, allQuestions)) {
            return;
        }

        setQuestionFormValid(
            proposedQuestionText.length > 0 && answerEntryValue.length > 0,
        );
        setProposedQuestionText(inputText);
        setSavePossible(true);
    };

    const onBlur = isAddingNewQuestion
        ? onBlurIsAddingNewQuestion
        : onBlurIsEditingQuestion;

    return (
        <form action={clickSaveQuestion}>
            <EditableHeader
                currentProposal={proposedQuestionText}
                isEditing={isEditingQuestionText}
                isPending={false}
                onBlur={onBlur}
                setIsEditing={setIsEditingQuestionText}
                title="Question"
            ></EditableHeader>
            <AnswerSection></AnswerSection>
            <div className={styles.padsavebutton}>
                {deleteButton}
                <Button
                    disabled={!savePossible || pending || !questionFormValid}
                >
                    Save question
                </Button>
            </div>
        </form>
    );
}
