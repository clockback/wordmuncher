import { useContext } from "react";

import editSheetContext from "../../context";
import styles from "./other-answers-table.module.css";

export default function OtherAnswersTable() {
    const { selectedQuestion } = useContext(editSheetContext);

    const otherAnswerRows = [];
    for (let answer of selectedQuestion.answers) {
        if (answer.isMainAnswer) {
            continue;
        }
        otherAnswerRows.push(
            <tr key={answer.id}>
                <td className={styles.otheranswer}>{answer.answerText}</td>
                <td
                    className={styles.promoteanswer}
                    title="Promote to main answer"
                >
                    ⤴
                </td>
            </tr>,
        );
    }

    return (
        <table className={styles.otheranswerstable}>
            <tbody>{otherAnswerRows}</tbody>
        </table>
    );
}
