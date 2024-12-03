"use client";

import { useState } from "react";

import styles from "./tongueselector.module.css";
import TonguesPopup from "../tonguespopup/tonguespopup";
import Button from "@components/button/button";
import Flag from "@components/flag/flag";
import SheetsList from "../sheetslist/sheetslist";

interface TongueSelectorProps {
    onChangeTongue: (tongueId: number) => Promise<{
        id: number;
        tongueName: string;
        flag: string;
        sheets: { sheetId: number; sheetName: string }[];
    }>;
    allTongues: {
        id: number;
        tongueName: string;
        flag: string;
    }[];
    initialTongue: {
        id: number;
        tongueName: string;
        flag: string;
        sheets: { sheetId: number; sheetName: string }[];
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
        flag = <Flag flag={currentTongue.flag}></Flag>;
    }

    return (
        <>
            <div className={styles.header}>{learnLanguageText}</div>
            {flag}
            <Button onClick={() => setPopupVisible(true)}>
                Change language
            </Button>
            <SheetsList
                sheets={currentTongue ? currentTongue.sheets : []}
            ></SheetsList>
            {popup}
        </>
    );
}
