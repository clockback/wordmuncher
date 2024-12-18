import { useContext } from "react";

import editSheetContext from "../../context";
import AddOtherAnswer from "../add-other-answer/add-other-answer";
import styles from "./other-answers-table.module.css";

export default function OtherAnswersTable() {
    const {
        answerEntryValue,
        otherAnswers,
        setAnswerEntryValue,
        setOtherAnswers,
        setSavePossible,
    } = useContext(editSheetContext);

    const otherAnswerRows = [];

    for (const [answerI, answer] of otherAnswers.entries()) {
        const promote = () => {
            const newOtherAnswers: string[] = Object.assign([], otherAnswers);
            newOtherAnswers[answerI] = answerEntryValue;

            setOtherAnswers(newOtherAnswers);
            setAnswerEntryValue(answer);
            setSavePossible(true);
        };

        otherAnswerRows.push(
            <tr key={answerI}>
                <td className={styles.otheranswer}>{answer}</td>
                <td
                    className={styles.promoteanswer}
                    title="Promote to main answer"
                    onClick={promote}
                >
                    ⤴
                </td>
            </tr>,
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
