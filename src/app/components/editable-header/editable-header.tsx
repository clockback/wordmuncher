import { Dispatch, SetStateAction, useState } from "react";

import styles from "./editable-header.module.css";

interface EditableHeaderProps {
    currentProposal: string;
    isEditing: boolean;
    onBlur: (inputText: string) => void;
    isPending: boolean;
    setIsEditing: Dispatch<SetStateAction<boolean>>;
    title: string;
}

export default function EditableHeader({
    currentProposal,
    isEditing,
    isPending = false,
    onBlur,
    setIsEditing,
    title,
}: EditableHeaderProps) {
    const [inputText, setInputText] = useState<string>("");

    if (!isEditing) {
        const edit = () => {
            if (isPending) {
                return;
            }
            setInputText(currentProposal);
            setIsEditing(true);
        };

        return (
            <h1 className={styles.header} onClick={edit} title={title}>
                {currentProposal}
            </h1>
        );
    }

    const onBlurWithInputText = () => {
        onBlur(inputText.trim());
    };

    function preventFormSubmission(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.code == "Enter") {
            e.preventDefault();
            onBlurWithInputText();
        }
    }

    const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
    };

    return (
        <h1 className={styles.header}>
            <input
                autoFocus
                className={styles.input}
                onChange={onChangeText}
                onBlur={onBlurWithInputText}
                onKeyDown={preventFormSubmission}
                value={inputText}
                title={title}
            ></input>
        </h1>
    );
}
