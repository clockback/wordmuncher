"use client";

import { useState } from "react";

import Button from "@components/button/button";
import Flag from "@components/flag/flag";
import TonguesPopup from "@components/tongues-popup/tongues-popup";

import styles from "./native-tongue-selector.module.css";

interface NativeTongueSelectorProps {
    onChangeNativeTongue: (tongueId: number) => Promise<{
        id: number;
        tongueName: string;
        flag: string;
    }>;
    onChangeIgnoreDiacritics: (value: boolean) => Promise<void>;
    onChangeSpeechEnabled: (value: boolean) => Promise<void>;
    allTongues: { id: number; tongueName: string; flag: string }[];
    initialNativeTongue: {
        id: number;
        tongueName: string;
        flag: string;
    };
    initialIgnoreDiacritics: boolean;
    initialSpeechEnabled: boolean;
}

export default function NativeTongueSelector({
    onChangeNativeTongue,
    onChangeIgnoreDiacritics,
    onChangeSpeechEnabled,
    allTongues,
    initialNativeTongue,
    initialIgnoreDiacritics,
    initialSpeechEnabled,
}: NativeTongueSelectorProps) {
    const [nativeTongue, setNativeTongue] = useState(initialNativeTongue);
    const [popupVisible, setPopupVisible] = useState(false);
    const [ignoreDiacritics, setIgnoreDiacritics] = useState(
        initialIgnoreDiacritics,
    );
    const [speechEnabled, setSpeechEnabled] = useState(initialSpeechEnabled);

    const updateNativeTongue = async (tongueId: number) => {
        setNativeTongue(await onChangeNativeTongue(tongueId));
    };

    const popup = popupVisible ? (
        <TonguesPopup
            allTongues={allTongues}
            onClose={() => setPopupVisible(false)}
            onChangeTongue={updateNativeTongue}
            title="What is your native language?"
            context="native"
        ></TonguesPopup>
    ) : null;

    return (
        <>
            <div className={styles.header} title="Settings">
                Settings
            </div>
            <div className={styles.section} title="Native language">
                Native language: {nativeTongue.tongueName}
            </div>
            <Flag flag={nativeTongue.flag}></Flag>
            <div className={styles.buttonVerticalMargin}>
                <Button onClick={() => setPopupVisible(true)}>
                    Change native language
                </Button>
            </div>
            <div className={styles.section} title="Diacritics">
                <label className={styles.toggle}>
                    <input
                        type="checkbox"
                        checked={ignoreDiacritics}
                        onChange={async (e) => {
                            const value = e.target.checked;
                            setIgnoreDiacritics(value);
                            await onChangeIgnoreDiacritics(value);
                        }}
                    />
                    Ignore diacritics when testing
                </label>
            </div>
            <div className={styles.section} title="Speech">
                <label className={styles.toggle}>
                    <input
                        type="checkbox"
                        checked={speechEnabled}
                        onChange={async (e) => {
                            const value = e.target.checked;
                            setSpeechEnabled(value);
                            await onChangeSpeechEnabled(value);
                        }}
                    />
                    Text-to-speech during tests
                </label>
            </div>
            <Button href="/">Back</Button>
            {popup}
        </>
    );
}
