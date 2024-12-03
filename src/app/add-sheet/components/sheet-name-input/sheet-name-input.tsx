"use client";

import { useState } from "react";

import styles from "./sheet-name-input.module.css";

interface SheetNameInputProps {
    onChange: (sheetName: string) => Promise<boolean>;
}

export default function SheetNameInput({ onChange }: SheetNameInputProps) {
    const [sheetInputEmpty, setSheetInputEmpty] = useState(false);
    const [sheetFound, setSheetFound] = useState(false);

    const inputOnChange = async (input: React.FormEvent<HTMLInputElement>) => {
        const proposedName = input.currentTarget.value.trim();
        setSheetInputEmpty(proposedName === "");
        setSheetFound(await onChange(input.currentTarget.value.trim()));
    };

    const warning = (
        <div className={styles.warning}>
            {sheetFound
                ? "Sheet already exists!"
                : sheetInputEmpty
                  ? "Missing sheet name!"
                  : ""}
        </div>
    );

    return (
        <>
            <input
                className={styles.centreinput}
                onChange={inputOnChange}
            ></input>
            {warning}
        </>
    );
}
