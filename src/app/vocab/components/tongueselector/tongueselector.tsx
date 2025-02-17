"use client";

import { JSX, useState } from "react";

import Button from "@components/button/button";
import Flag from "@components/flag/flag";

import SheetsList from "../sheetslist/sheetslist";
import TonguesPopup from "../tonguespopup/tonguespopup";
import styles from "./tongueselector.module.css";

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
    const [currentTongue, setCurrentTongue] = useState<{
        id: number;
        tongueName: string;
        flag: string;
        sheets: { sheetId: number; sheetName: string }[];
    } | null>(initialTongue);
    const [popupVisible, setPopupVisible] = useState<boolean>(false);

    const updateCurrentTongue = async (tongueId: number) => {
        setCurrentTongue(await onChangeTongue(tongueId));
    };

    const popup = popupVisible ? (
        <TonguesPopup
            allTongues={allTongues}
            onClose={() => setPopupVisible(false)}
            onChangeTongue={updateCurrentTongue}
        ></TonguesPopup>
    ) : null;

    let learnLanguageText: string;
    let flag: JSX.Element | null = null;
    let tonguePairButtons: JSX.Element[] = [];
    if (currentTongue === null) {
        learnLanguageText = "What language do you want to learn?";
    } else {
        learnLanguageText = `Learning ${currentTongue.tongueName}!`;
        flag = <Flag flag={currentTongue.flag}></Flag>;
        tonguePairButtons = [
            <div key={1} className={styles.buttonVerticalMargin}>
                <Button href="/vocab/add-sheet">Add sheet</Button>
            </div>,
            <div key={2} className={styles.buttonVerticalMargin}>
                <Button href="/vocab/inflections">Inflection tables</Button>
            </div>,
        ];
    }

    return (
        <>
            <div className={styles.header} title="Current language">
                {learnLanguageText}
            </div>
            {flag}
            <div className={styles.buttonVerticalMargin}>
                <Button onClick={() => setPopupVisible(true)}>
                    Change language
                </Button>
            </div>
            <SheetsList
                sheets={currentTongue ? currentTongue.sheets : []}
            ></SheetsList>
            {tonguePairButtons}
            {popup}
        </>
    );
}
