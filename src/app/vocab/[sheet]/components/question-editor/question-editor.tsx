"use client";

import { NextResponse } from "next/server";
import { useContext } from "react";

import Button from "@components/button/button";
import EditableHeader from "@components/editable-header/editable-header";

import { InflectionType, Question } from "@models";

import {
    AddQuestionRequestAPI,
    AddQuestionResponseAPI,
} from "../../add-question/api";
import editSheetContext from "../../context";
import AnswerSection from "../answer-section/answer-section";
import CreateInvertedEntry from "../create-inverted-entry/create-inverted-entry";
import styles from "./question-editor.module.css";
import { DeleteQuestionRequestAPI } from "src/app/vocab/delete-question/api";
import {
    UpdateQuestionRequestAPI,
    UpdateQuestionResponseAPISuccess,
} from "src/app/vocab/update-question/api";

function questionAlreadyExists(questionText: string, allQuestions: Question[]) {
    for (const question of allQuestions) {
        if (question.questionText == questionText) {
            return true;
        }
    }
    return false;
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
        createInvertedEntry,
        isAddingNewQuestion,
        isEditingQuestionText,
        isStudyingLanguage,
        nativeTongue,
        otherAnswers,
        pending,
        proposedInflectionAnswers,
        proposedInflectionType,
        proposedQuestionText,
        savePossible,
        selectedQuestion,
        setAllQuestions,
        setAnswerEntryValue,
        setCreateInvertedEntry,
        setIsAddingNewQuestion,
        setIsEditingQuestionText,
        setIsStudyingLanguage,
        setOtherAnswers,
        setPending,
        setProposedQuestionText,
        setSavePossible,
        setSelectedQuestion,
        sheetId,
        studyingTongue,
    } = useContext(editSheetContext);

    if (selectedQuestion === null && !isAddingNewQuestion) {
        return <></>;
    }

    function updateQuestion(
        question: Question,
        contents: UpdateQuestionResponseAPISuccess,
    ) {
        question.questionText = contents.questionText;
        question.answers = contents.answers.slice();
        question.inflectionAnswers = contents.inflectionAnswers.slice();
    }

    async function clickSaveNewQuestionHandleResponse(response: NextResponse) {
        const responseJSON: AddQuestionResponseAPI = await response.json();
        const updatedQuestions = structuredClone(allQuestions);
        updatedQuestions.push(responseJSON as Question);
        setAllQuestions(updatedQuestions);
        setPending(false);

        if (createInvertedEntry) {
            const oldQuestion = proposedQuestionText.trim();
            const oldAnswer = answerEntryValue.trim();
            setProposedQuestionText(oldAnswer);
            setAnswerEntryValue(oldQuestion);
            setIsStudyingLanguage(!isStudyingLanguage);
            setOtherAnswers([]);
            setSavePossible(
                !questionAlreadyExists(oldAnswer, updatedQuestions),
            );
            setCreateInvertedEntry(false);
        } else {
            setSavePossible(false);
            setIsAddingNewQuestion(false);
        }
    }

    function getPlainAnswerBody(): {
        proposedMainAnswer: string;
        proposedOtherAnswers: string[];
    } {
        return {
            proposedMainAnswer: answerEntryValue.trim(),
            proposedOtherAnswers: otherAnswers,
        };
    }

    function getInflectionAnswerBody(inflectionId: number): {
        proposedInflectionType: number;
        proposedInflectionAnswers: {
            primaryFeature: number;
            secondaryFeature?: number;
            answer: string;
        }[];
    };
    function getInflectionAnswerBody(inflectionId?: undefined): {
        proposedInflectionType: undefined;
        proposedInflectionAnswers: {
            primaryFeature: number;
            secondaryFeature?: number;
            answer: string;
        }[];
    };
    function getInflectionAnswerBody(inflectionId?: number): {
        proposedInflectionType: number;
        proposedInflectionAnswers: {
            primaryFeature: number;
            secondaryFeature?: number;
            answer: string;
        }[];
    } {
        const answers = [];

        const primaryCategory = proposedInflectionType.categories[0];
        for (const primaryFeature of primaryCategory.features) {
            if (proposedInflectionType.categories.length === 1) {
                const answerKey = primaryFeature.id.toString();
                const submitAnswer = proposedInflectionAnswers.get(answerKey);
                if (submitAnswer) {
                    answers.push({
                        primaryFeature: primaryFeature.id,
                        answer: submitAnswer,
                    });
                }
            } else {
                const secondaryCategory = proposedInflectionType.categories[1];
                for (const secondaryFeature of secondaryCategory.features) {
                    const answerKey = `${primaryFeature.id},${secondaryFeature.id}`;
                    const submitAnswer =
                        proposedInflectionAnswers.get(answerKey);
                    if (submitAnswer) {
                        answers.push({
                            primaryFeature: primaryFeature.id,
                            secondaryFeature: secondaryFeature.id,
                            answer: submitAnswer,
                        });
                    }
                }
            }
        }

        return {
            proposedInflectionAnswers: answers,
            proposedInflectionType: inflectionId,
        };
    }

    function getAnswerBody(inflectionId: number): {
        proposedInflectionType: number;
        proposedInflectionAnswers: {
            primaryFeature: number;
            secondaryFeature?: number;
            answer: string;
        }[];
    };
    function getAnswerBody(inflectionId?: undefined):
        | {
              proposedMainAnswer: string;
              proposedOtherAnswers: string[];
          }
        | {
              proposedInflectionType: undefined;
              proposedInflectionAnswers: {
                  primaryFeature: number;
                  secondaryFeature?: number;
                  answer: string;
              }[];
          };
    function getAnswerBody(inflectionId?: number):
        | {
              proposedMainAnswer: string;
              proposedOtherAnswers: string[];
          }
        | {
              proposedInflectionType: number | undefined;
              proposedInflectionAnswers: {
                  primaryFeature: number;
                  secondaryFeature?: number;
                  answer: string;
              }[];
          } {
        if (inflectionId !== undefined)
            return getInflectionAnswerBody(inflectionId);
        if (proposedInflectionType === null) return getPlainAnswerBody();
        return getInflectionAnswerBody();
    }

    function clickSaveNewQuestion() {
        const body: AddQuestionRequestAPI = {
            proposedQuestionText: proposedQuestionText.trim(),
            isStudyingLanguage,
            ...getAnswerBody(
                proposedInflectionType ? proposedInflectionType.id : undefined,
            ),
        };
        fetch(`/vocab/${sheetId}/add-question`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).then(clickSaveNewQuestionHandleResponse);
    }

    async function clickSaveEditQuestionHandleResponse(response: NextResponse) {
        if (!response.ok) {
            console.error("Updating question failed.");
            return;
        }
        const responseJSON: UpdateQuestionResponseAPISuccess =
            await response.json();
        const questionId = responseJSON.questionId;
        const updatedQuestions = structuredClone(allQuestions);
        for (const question of updatedQuestions) {
            if (question.id == questionId) {
                updateQuestion(question, responseJSON);
            }
        }
        setAllQuestions(updatedQuestions);
        setSavePossible(false);
        setPending(false);
    }

    function clickSaveEditQuestion() {
        const body: UpdateQuestionRequestAPI = {
            id: selectedQuestion.id,
            proposedQuestionText: proposedQuestionText.trim(),
            isStudyingLanguage,
            ...getAnswerBody(
                proposedInflectionType ? proposedInflectionType.id : undefined,
            ),
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
        setPending(false);

        if (!response.ok) {
            return;
        }

        const updatedQuestions = allQuestions.filter(
            (question) => question.id !== selectedQuestion.id,
        );
        setAllQuestions(updatedQuestions);
        setSelectedQuestion(null);
    };

    const clickDeleteQuestion = () => {
        setPending(true);
        const body: DeleteQuestionRequestAPI = { id: selectedQuestion.id };
        fetch("/vocab/delete-question", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
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
                key={selectedQuestion !== null ? selectedQuestion.id : null}
                currentProposal={proposedQuestionText}
                isEditing={isEditingQuestionText}
                isPending={false}
                onBlur={onBlur}
                setIsEditing={setIsEditingQuestionText}
                title="Question"
            ></EditableHeader>
            <div className={styles.languagetoggle} title="Question language">
                <span
                    className={
                        isStudyingLanguage ? styles.active : styles.inactive
                    }
                    onClick={() => {
                        if (!isStudyingLanguage) {
                            setIsStudyingLanguage(true);
                            setSavePossible(true);
                        }
                    }}
                >
                    {studyingTongue.flag} {studyingTongue.tongueName}
                </span>
                <span
                    className={
                        !isStudyingLanguage ? styles.active : styles.inactive
                    }
                    onClick={() => {
                        if (isStudyingLanguage) {
                            setIsStudyingLanguage(false);
                            setSavePossible(true);
                        }
                    }}
                >
                    {nativeTongue.flag} {nativeTongue.tongueName}
                </span>
            </div>
            <AnswerSection></AnswerSection>
            <CreateInvertedEntry />
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
