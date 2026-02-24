"use client";

import { JSX, useRef, useState } from "react";

import Button from "@components/button/button";
import Flag from "@components/flag/flag";
import TonguesPopup from "@components/tongues-popup/tongues-popup";

import { ImportSheetResponseAPI } from "../../import-sheet/api";
import SheetsList from "../sheetslist/sheetslist";
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateCurrentTongue = async (tongueId: number) => {
        setCurrentTongue(await onChangeTongue(tongueId));
    };

    function importSheet() {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    }

    async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        let data: unknown;
        try {
            data = JSON.parse(await file.text());
        } catch {
            alert("Invalid JSON file.");
            return;
        }

        const response = await fetch("/vocab/import-sheet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result: ImportSheetResponseAPI = await response.json();

        if (!response.ok) {
            alert(result.error || "Failed to import sheet.");
            return;
        }

        window.location.href = `/vocab/${result.sheetId}`;
    }

    const popup = popupVisible ? (
        <TonguesPopup
            allTongues={allTongues}
            onClose={() => setPopupVisible(false)}
            onChangeTongue={updateCurrentTongue}
            context="studying"
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
                <Button onClick={importSheet}>Import</Button>
            </div>,
            <div key={3} className={styles.buttonVerticalMargin}>
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
            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileSelected}
            />
            {popup}
        </>
    );
}
