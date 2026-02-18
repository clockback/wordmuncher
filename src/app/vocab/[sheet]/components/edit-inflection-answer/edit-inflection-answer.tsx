import { useContext, useState } from "react";

import editSheetContext from "../../context";
import styles from "./edit-inflection-answer.module.css";

interface EditInflectionAnswerProps {
    featureIndex: string;
    proposedAnswer: string | null;
}

export default function EditInflectionAnswer({
    featureIndex,
    proposedAnswer,
}: EditInflectionAnswerProps) {
    const {
        proposedInflectionAnswers,
        setProposedInflectionAnswers,
        setSavePossible,
    } = useContext(editSheetContext);

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editingText, setEditingText] = useState<string>(
        proposedAnswer ?? "",
    );

    if (isEditing) {
        const onBlur = () => {
            if (!document.hasFocus()) return;
            setIsEditing(false);

            if (editingText === proposedAnswer) {
                return;
            }

            const newProposedInflectionAnswers = new Map(
                proposedInflectionAnswers,
            );
            newProposedInflectionAnswers.set(
                featureIndex,
                editingText.length > 0 ? editingText : null,
            );
            setSavePossible(true);
            setProposedInflectionAnswers(newProposedInflectionAnswers);
        };

        const editAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
            setEditingText(e.target.value);
        };

        function preventFormSubmission(
            e: React.KeyboardEvent<HTMLInputElement>,
        ) {
            if (e.code == "Enter") {
                e.preventDefault();
                onBlur();
            }
        }

        return (
            <input
                className={styles.edit}
                autoFocus
                onBlur={onBlur}
                onChange={editAnswer}
                value={editingText}
                onKeyDown={preventFormSubmission}
            ></input>
        );
    } else {
        const onClick = () => {
            setIsEditing(true);
        };

        return (
            <div className={styles.select} onClick={onClick}>
                {proposedAnswer}
            </div>
        );
    }
}
