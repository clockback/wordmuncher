"use client";

import { NextResponse } from "next/server";
import { useContext } from "react";

import Button from "@components/button/button";
import EditableHeader from "@components/editable-header/editable-header";

import { Answer, InflectionAnswer, InflectionType, Question } from "@models";

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
    questionText: string;
    answers: Answer[];
    inflectionAnswers: InflectionAnswer[];
}

function questionIsValid(
    question: string,
    answerText: string | null,
    inflectionType: InflectionType | null,
    inflectionAnswers: Map<string, string>,
): boolean {
    if (question.length === 0) {
        return false;
    } else if (inflectionType === null) {
        return answerText.length > 0;
    }

    for (const primaryFeature of inflectionType.categories[0].features) {
        if (inflectionType.categories.length === 1) {
            if (inflectionAnswers.get(primaryFeature.id.toString())) {
                return true;
            }
        } else {
            const secondaryCategory = inflectionType.categories[1];
            for (const secondaryFeature of secondaryCategory.features) {
                if (
                    inflectionAnswers.get(
                        `${primaryFeature.id},${secondaryFeature.id}`,
                    )
                ) {
                    return true;
                }
            }
        }
    }

    return false;
}

export default function QuestionEditor() {
    const {
        allQuestions,
        answerEntryValue,
        isAddingNewQuestion,
        isEditingQuestionText,
        otherAnswers,
        pending,
        proposedInflectionAnswers,
        proposedInflectionType,
        proposedQuestionText,
        savePossible,
        selectedQuestion,
        setAllQuestions,
        setIsAddingNewQuestion,
        setIsEditingQuestionText,
        setPending,
        setProposedQuestionText,
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
        question.answers = contents.answers.slice();
        question.inflectionAnswers = contents.inflectionAnswers.slice();
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

    function getAnswerBody() {
        const answerBody = {};
        if (proposedInflectionType === null) {
            answerBody["proposedMainAnswer"] = answerEntryValue.trim();
            answerBody["proposedOtherAnswers"] = otherAnswers;
        } else {
            answerBody["proposedInflectionType"] = proposedInflectionType.id;
            answerBody["proposedInflectionAnswers"] = [];

            const primaryCategory = proposedInflectionType.categories[0];
            for (const primaryFeature of primaryCategory.features) {
                if (proposedInflectionType.categories.length === 1) {
                    const answerKey = primaryFeature.id.toString();
                    const submitAnswer =
                        proposedInflectionAnswers.get(answerKey);
                    if (submitAnswer) {
                        answerBody["proposedInflectionAnswers"].push({
                            primaryFeature: primaryFeature.id,
                            answer: submitAnswer,
                        });
                    }
                } else {
                    const secondaryCategory =
                        proposedInflectionType.categories[1];
                    for (const secondaryFeature of secondaryCategory.features) {
                        const answerKey = `${primaryFeature.id},${secondaryFeature.id}`;
                        const submitAnswer =
                            proposedInflectionAnswers.get(answerKey);
                        if (submitAnswer) {
                            answerBody["proposedInflectionAnswers"].push({
                                primaryFeature: primaryFeature.id,
                                secondaryFeature: secondaryFeature.id,
                                answer: submitAnswer,
                            });
                        }
                    }
                }
            }
        }
        return answerBody;
    }

    function clickSaveNewQuestion() {
        const body = {
            sheetId: sheetId,
            proposedQuestionText: proposedQuestionText.trim(),
            ...getAnswerBody(),
        };
        fetch(`/vocab/${sheetId}/add-question`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
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

    function clickSaveEditQuestion() {
        const body = {
            id: selectedQuestion.id,
            proposedQuestionText: proposedQuestionText.trim(),
            ...getAnswerBody(),
        };
        fetch("/vocab/update-question", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).then(clickSaveEditQuestionHandleResponse);
    }

    function clickSaveQuestion() {
        setPending(true);
        setIsEditingQuestionText(false);

        if (isAddingNewQuestion) {
            clickSaveNewQuestion();
        } else {
            clickSaveEditQuestion();
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
                    disabled={
                        !savePossible ||
                        pending ||
                        !questionIsValid(
                            proposedQuestionText,
                            answerEntryValue,
                            proposedInflectionType,
                            proposedInflectionAnswers,
                        )
                    }
                >
                    Save question
                </Button>
            </div>
        </form>
    );
}
