import { useContext } from "react";

import { leftUnanswered } from "../../client-helpers";
import testSheetContext from "../../context";
import styles from "./inflection-answer.entry.module.css";

interface InflectionAnswerEntryProps {
    featureKey: string;
}

export default function InflectionAnswerEntry({
    featureKey,
}: InflectionAnswerEntryProps) {
    const {
        pending,
        inflectionAnswers,
        inflectionCorrections,
        setInflectionAnswers,
        submitAnswer,
    } = useContext(testSheetContext);

    const correction = inflectionCorrections.get(featureKey) ?? null;
    if (correction !== null) {
        return (
            <div>
                <span className={styles.correction}>{correction}</span>
                <span className={styles.incorrect}>
                    {inflectionAnswers.get(featureKey)}
                </span>
            </div>
        );
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") {
            return;
        }
        e.preventDefault();
        if (!leftUnanswered(inflectionAnswers)) {
            submitAnswer();
        }
    };

    const onChangeCurrentValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedInflectionAnswers = new Map(inflectionAnswers);
        updatedInflectionAnswers.set(featureKey, e.target.value);
        setInflectionAnswers(updatedInflectionAnswers);
    };

    return (
        <input
            className={styles.answerentry}
            value={inflectionAnswers.get(featureKey)}
            onKeyDown={onKeyDown}
            disabled={pending}
            onChange={onChangeCurrentValue}
        ></input>
    );
}
