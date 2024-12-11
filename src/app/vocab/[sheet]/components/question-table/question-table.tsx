import { Question } from "@models";

import styles from "./question-table.module.css";

export default function QuestionTable({
    allQuestions,
}: {
    allQuestions: Question[];
}) {
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

        questionRows.push(
            <tr key={question.id}>
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
