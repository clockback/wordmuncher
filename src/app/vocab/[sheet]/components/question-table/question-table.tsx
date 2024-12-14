import { Question } from "@models";

import styles from "./question-table.module.css";

interface QuestionJSONProps {
    questionText: string;
    id: number;
    answers: { answerText: string; isMainAnswer: boolean }[];
}

interface QuestionTableProps {
    allQuestions: QuestionJSONProps[];
    onClickQuestion: (question: QuestionJSONProps) => void;
}

export default function QuestionTable({
    allQuestions,
    onClickQuestion,
}: QuestionTableProps) {
    const questionRows = [];
    for (let question of allQuestions) {
        const selectQuestion = () => {
            onClickQuestion(question);
        };

        let mainAnswer = "";
        if (question.answers) {
            for (let answer of question.answers) {
                if (answer.isMainAnswer) {
                    mainAnswer = answer.answerText;
                }
            }
        }

        questionRows.push(
            <tr key={question.id} onClick={selectQuestion}>
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
