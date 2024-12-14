import { Question } from "@models";

import styles from "./question-table.module.css";

interface QuestionJSONProps {
    questionText: string;
    id: number;
    answers: { answerText: string; isMainAnswer: boolean }[];
}

interface QuestionTableProps {
    allQuestions: Question[];
    onClickQuestion: (question: Question) => void;
    selectedQuestionId: number;
    promptSaveOnNavigate: boolean;
}

export default function QuestionTable({
    allQuestions,
    onClickQuestion,
    selectedQuestionId,
    promptSaveOnNavigate,
}: QuestionTableProps) {
    const questionRows = [];
    for (let question of allQuestions) {
        let mainAnswer = "";
        if (question.answers) {
            for (let answer of question.answers) {
                if (answer.isMainAnswer) {
                    mainAnswer = answer.answerText;
                }
            }
        }

        const questionIsSelected = question.id == selectedQuestionId;
        const questionModified = questionIsSelected && promptSaveOnNavigate;
        const rowClass = questionModified ? styles.selected : null;

        const selectQuestion = () => {
            if (!questionIsSelected) {
                onClickQuestion(question);
            }
        };

        questionRows.push(
            <tr className={rowClass} key={question.id} onClick={selectQuestion}>
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
