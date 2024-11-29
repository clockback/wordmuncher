"use client";

import styles from "./vocab.module.css";

interface TonguesPopupProps {
    allTongues: {
        id: number;
        tongueName: string;
        flag: string;
    }[];
    onClose: () => void;
    onChangeTongue: (tongueId: number) => void;
}

function makeTongueButton(
    tongue: {
        id: number;
        tongueName: string;
        flag: string;
    },
    onClose: () => void,
    onChangeTongue: (tongueId: number) => void,
) {
    const callback = () => {
        onChangeTongue(tongue.id);
        onClose();
    };

    return (
        <div className={styles.flagbutton} key={tongue.id} onClick={callback}>
            <div className={styles.flagbuttoncontents}>
                <div className={styles.flag}>{tongue.flag}</div>
                <div>{tongue.tongueName}</div>
            </div>
        </div>
    );
}

export default function TonguesPopup({
    allTongues,
    onClose,
    onChangeTongue,
}: TonguesPopupProps) {
    // Create array of buttons with flags for each tongue.
    let allTongueButtons = [];
    for (let tongue of allTongues) {
        allTongueButtons.push(
            makeTongueButton(tongue, onClose, onChangeTongue),
        );
    }

    return (
        <div className={styles.backdrop}>
            <div className={styles.popup}>
                <div className={styles.popupbar}>
                    <span className={styles.popupbartext}>
                        What language do you want to learn?
                    </span>
                    <div className={styles.popupbarclose} onClick={onClose}>
                        ×
                    </div>
                </div>
                {allTongueButtons}
                <div className={styles.flagbutton}>
                    <div className={styles.flagbuttoncontents}>
                        <div className={styles.flag}>🏳️</div>
                        <div>Add new language!</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
