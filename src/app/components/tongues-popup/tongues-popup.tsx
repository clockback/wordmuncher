"use client";

import { useState } from "react";

import styles from "./tongues-popup.module.css";

interface TonguesPopupProps {
    allTongues: {
        id: number;
        tongueName: string;
        flag: string;
    }[];
    onClose: () => void;
    onChangeTongue: (tongueId: number) => void;
    title?: string;
    context?: "native" | "studying";
}

export default function TonguesPopup({
    allTongues: initialTongues,
    onClose,
    onChangeTongue,
    title = "What language do you want to learn?",
    context,
}: TonguesPopupProps) {
    const [tongues, setTongues] = useState(initialTongues);

    async function deleteTongue(event: React.MouseEvent, tongueId: number) {
        event.stopPropagation();

        const response = await fetch(`/settings/delete-tongue/${tongueId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const result = await response.json();
            alert(result.error || "Failed to delete language.");
            return;
        }

        setTongues(tongues.filter((t) => t.id !== tongueId));
    }

    const allTongueButtons = [];
    for (const tongue of tongues) {
        allTongueButtons.push(
            <div
                title={tongue.tongueName}
                className={styles.flagbutton}
                key={tongue.id}
                onClick={() => {
                    onChangeTongue(tongue.id);
                    onClose();
                }}
            >
                <div
                    className={styles.deletebutton}
                    onClick={(e) => deleteTongue(e, tongue.id)}
                >
                    ×
                </div>
                <div className={styles.flagbuttoncontents}>
                    <div className={styles.flag}>{tongue.flag}</div>
                    <div>{tongue.tongueName}</div>
                </div>
            </div>,
        );
    }

    return (
        <div className={styles.backdrop}>
            <div className={styles.popup}>
                <div className={styles.popupbar}>
                    <span className={styles.popupbartext}>{title}</span>
                    <div className={styles.popupbarclose} onClick={onClose}>
                        ×
                    </div>
                </div>
                {allTongueButtons}
                <div
                    className={styles.flagbutton}
                    onClick={() => {
                        const params = context ? `?for=${context}` : "";
                        window.location.href = `/settings/add-tongue${params}`;
                    }}
                >
                    <div className={styles.flagbuttoncontents}>
                        <div className={styles.flag}>🏳️</div>
                        <div>Add new language!</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
