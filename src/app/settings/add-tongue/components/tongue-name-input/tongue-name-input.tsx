"use client";

import { useState } from "react";

import Button from "@components/button/button";

import styles from "./tongue-name-input.module.css";

interface TongueNameInputProps {
    onChange: (tongueName: string) => Promise<boolean>;
    pending: boolean;
}

export default function TongueNameInput({
    onChange,
    pending,
}: TongueNameInputProps) {
    const [nameEmpty, setNameEmpty] = useState<boolean>(true);
    const [showNameEmpty, setShowNameEmpty] = useState<boolean>(false);
    const [flagEmpty, setFlagEmpty] = useState<boolean>(true);
    const [showFlagEmpty, setShowFlagEmpty] = useState<boolean>(false);
    const [tongueFound, setTongueFound] = useState<boolean>(false);

    const nameOnChange = async (input: React.FormEvent<HTMLInputElement>) => {
        const proposedName = input.currentTarget.value.trim();
        setNameEmpty(proposedName === "");
        setShowNameEmpty(proposedName === "");
        setTongueFound(await onChange(proposedName));
    };

    const flagOnChange = (input: React.FormEvent<HTMLInputElement>) => {
        const proposedFlag = input.currentTarget.value.trim();
        setFlagEmpty(proposedFlag === "");
        setShowFlagEmpty(proposedFlag === "");
    };

    let warningText = "";
    if (tongueFound) {
        warningText = "Tongue already exists!";
    } else if (showNameEmpty) {
        warningText = "Missing tongue name!";
    } else if (showFlagEmpty) {
        warningText = "Missing flag!";
    }
    const warning = <div className={styles.warning}>{warningText}</div>;

    return (
        <>
            <input
                className={styles.centreinput}
                onChange={nameOnChange}
                name="tongue-name"
                type="text"
                placeholder="Language name"
            ></input>
            <input
                className={styles.centreinput}
                onChange={flagOnChange}
                name="flag"
                type="text"
                placeholder="Flag emoji"
            ></input>
            <input
                className={styles.centreinput}
                name="language-code"
                type="text"
                placeholder="Language code, e.g. de, fr, es (optional)"
            ></input>
            {warning}
            <div className={styles.centrebutton}>
                <Button
                    type="submit"
                    disabled={nameEmpty || flagEmpty || tongueFound || pending}
                >
                    Create
                </Button>
                <Button href="/settings">Back</Button>
            </div>
        </>
    );
}
