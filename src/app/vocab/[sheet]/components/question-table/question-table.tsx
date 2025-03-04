import { useContext } from "react";

import { Question } from "@models";

import editSheetContext from "../../context";
import styles from "./question-table.module.css";

export default function QuestionTable() {
    const questionRows = [];
    const {
        allQuestions,
        inflectionTypes,
        setProposedInflectionAnswers,
        savePossible,
        selectedQuestion,
        setAnswerEntryValue,
        setIsAddingNewQuestion,
        setIsEditingQuestionText,
        setOtherAnswers,
        setProposedInflectionType,
        setProposedQuestionText,
        setSavePossible,
        setSelectedQuestion,
    } = useContext(editSheetContext);

    function updateInflectionAnswersForSelectedQuestion(question: Question) {
        const currentInflectionAnswers = new Map<string, string>();
        for (const inflectionAnswer of question.inflectionAnswers) {
            let inflectionAnswerKey: string;
            if (inflectionAnswer.secondaryFeatureId === null) {
                inflectionAnswerKey =
                    inflectionAnswer.primaryFeatureId.toString();
            } else {
                inflectionAnswerKey = `${inflectionAnswer.primaryFeatureId},${inflectionAnswer.secondaryFeatureId}`;
            }
            currentInflectionAnswers.set(
                inflectionAnswerKey,
                inflectionAnswer.answerText,
            );
        }
        setProposedInflectionAnswers(currentInflectionAnswers);
    }

    function selectQuestion(question: Question) {
        setSelectedQuestion(question);
        updateInflectionAnswersForSelectedQuestion(question);

        if (question.inflectionTypeId === null) {
            setProposedInflectionType(null);
        } else {
            for (const inflectionType of inflectionTypes) {
                if (question.inflectionTypeId === inflectionType.id) {
                    setProposedInflectionType(inflectionType);
                }
            }
        }

        setSavePossible(false);
        setIsEditingQuestionText(false);
        setProposedQuestionText(question.questionText);
        setIsAddingNewQuestion(false);

        let mainAnswer: string | null = null;
        const otherAnswers: string[] = [];

        for (const answer of question.answers) {
            if (answer.isMainAnswer) {
                mainAnswer = answer.answerText;
            } else {
                otherAnswers.push(answer.answerText);
            }
        }
        if (mainAnswer !== null) {
            setAnswerEntryValue(mainAnswer);
        }
        setOtherAnswers(otherAnswers);
    }

    for (const question of allQuestions) {
        let mainAnswer = "";
        if (question.answers) {
            for (const answer of question.answers) {
                if (answer.isMainAnswer) {
                    mainAnswer = answer.answerText;
                }
            }
        }

        const questionIsSelected =
            selectedQuestion && question.id == selectedQuestion.id;
        const questionModified = questionIsSelected && savePossible;
        const rowClass = questionModified ? styles.selected : null;

        const onClickQuestion = () => {
            if (!questionIsSelected) {
                selectQuestion(question);
            }
        };

        questionRows.push(
            <tr
                className={rowClass}
                key={question.id}
                onClick={onClickQuestion}
            >
                <td>{question.questionText}</td>
                <td>{mainAnswer}</td>
            </tr>,
        );
    }

    const clickAddNewQuestion = () => {
        setSelectedQuestion(null);
        setIsAddingNewQuestion(true);
        setProposedQuestionText("");
        setAnswerEntryValue("");
        setOtherAnswers([]);
        setIsEditingQuestionText(true);
        setProposedInflectionAnswers(new Map());
        setProposedInflectionType(null);
    };

    return (
        <table className={styles.questiontable}>
            <thead>
                <tr>
                    <th>Question</th>
                    <th>Answer</th>
                </tr>
            </thead>
            <tbody>
                {questionRows}
                <tr>
                    <td
                        className={styles.addnewquestionbutton}
                        colSpan={2}
                        onClick={clickAddNewQuestion}
                        title="Add new question"
                    >
                        Add new question
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
