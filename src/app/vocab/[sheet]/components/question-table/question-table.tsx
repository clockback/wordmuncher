import { useContext } from "react";

import { Question } from "@models";

import editSheetContext from "../../context";
import styles from "./question-table.module.css";

export default function QuestionTable() {
    const questionRows = [];
    const {
        allQuestions,
        savePossible,
        selectedQuestion,
        setAnswerEntryValue,
        setIsEditingQuestionText,
        setSavePossible,
        setProposedQuestionText,
        setSelectedQuestion,
    } = useContext(editSheetContext);

    function selectQuestion(question: Question) {
        setSelectedQuestion(question);
        setSavePossible(false);
        setIsEditingQuestionText(false);
        setProposedQuestionText(question.questionText);

        let mainAnswer: string | null = null;
        for (let answer of question.answers) {
            if (answer.isMainAnswer) {
                mainAnswer = answer.answerText;
                break;
            }
        }
        if (mainAnswer !== null) {
            setAnswerEntryValue(mainAnswer);
        }
    }

    for (let question of allQuestions) {
        let mainAnswer = "";
        if (question.answers) {
            for (let answer of question.answers) {
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

    return (
        <table className={styles.questiontable}>
            <thead>
                <tr>
                    <th>Question</th>
                    <th>Answer</th>
                </tr>
            </thead>
            <tbody>{questionRows}</tbody>
        </table>
    );
}
