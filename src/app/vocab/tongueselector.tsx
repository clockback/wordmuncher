"use client";

import { useState } from "react";

import styles from "./vocab.module.css";
import TonguesPopup from "./tonguespopup";
import Button from "@components/button/button";

interface TongueSelectorProps {
    onChangeTongue: (
        tongueId: number,
    ) => Promise<{ id: number; tongueName: string; flag: string }>;
    allTongues: {
        id: number;
        tongueName: string;
        flag: string;
    }[];
    initialTongue: {
        id: number;
        tongueName: string;
        flag: string;
    } | null;
}

export default function TongueSelector({
    onChangeTongue,
    allTongues,
    initialTongue,
}: TongueSelectorProps) {
    const [currentTongue, setCurrentTongue] = useState(initialTongue);
    const [popupVisible, setPopupVisible] = useState(false);

    const updateCurrentTongue = async (tongueId: number) => {
        setCurrentTongue(await onChangeTongue(tongueId));
    };

    let popup = popupVisible ? (
        <TonguesPopup
            allTongues={allTongues}
            onClose={() => setPopupVisible(false)}
            onChangeTongue={updateCurrentTongue}
        ></TonguesPopup>
    ) : null;

    let learnLanguageText: string;
    let flag: null | JSX.Element;
    if (currentTongue === null) {
        learnLanguageText = "What language do you want to learn?";
        flag = null;
    } else {
        learnLanguageText = `Learning ${currentTongue.tongueName}!`;
        flag = <div className={styles.learningflag}>{currentTongue.flag}</div>;
    }

    return (
        <div className={styles.centre}>
            <div className={styles.header}>{learnLanguageText}</div>
            {flag}
            <Button onClick={() => setPopupVisible(true)}>
                Change language
            </Button>
            {popup}
        </div>
    );
}
