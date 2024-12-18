import { useContext } from "react";

import editSheetContext from "../../context";
import AddOtherAnswer from "../add-other-answer/add-other-answer";
import EditOtherAnswer from "../other-answer/other-answer";
import styles from "./other-answers-table.module.css";

export default function OtherAnswersTable() {
    const { otherAnswers } = useContext(editSheetContext);

    const otherAnswerRows = [];

    for (const [answerI, answer] of otherAnswers.entries()) {
        otherAnswerRows.push(
            <EditOtherAnswer
                key={answerI}
                answer={answer}
                answerI={answerI}
            ></EditOtherAnswer>,
        );
    }

    return (
        <table className={styles.otheranswerstable}>
            <tbody>
                {otherAnswerRows}
                <AddOtherAnswer></AddOtherAnswer>
            </tbody>
        </table>
    );
}
