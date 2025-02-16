"use client";

import { useState } from "react";

import Button from "@components/button/button";

import styles from "./sheet-name-input.module.css";

interface SheetNameInputProps {
    onChange: (sheetName: string) => Promise<boolean>;
    pending: boolean;
}

export default function SheetNameInput({
    onChange,
    pending,
}: SheetNameInputProps) {
    const [sheetInputEmpty, setSheetInputEmpty] = useState<boolean>(true);
    const [showSheetInputEmpty, setShowSheetInputEmpty] =
        useState<boolean>(false);
    const [sheetFound, setSheetFound] = useState<boolean>(false);

    const inputOnChange = async (input: React.FormEvent<HTMLInputElement>) => {
        const proposedName = input.currentTarget.value.trim();
        setSheetInputEmpty(proposedName === "");
        setShowSheetInputEmpty(proposedName === "");
        setSheetFound(await onChange(input.currentTarget.value.trim()));
    };

    let warningText = "";
    if (sheetFound) {
        warningText = "Sheet already exists!";
    } else if (showSheetInputEmpty) {
        warningText = "Missing sheet name!";
    }
    const warning = <div className={styles.warning}>{warningText}</div>;

    return (
        <>
            <input
                className={styles.centreinput}
                onChange={inputOnChange}
                name="sheet-name"
                type="text"
            ></input>
            {warning}
            <div className={styles.centrebutton}>
                <Button
                    type="submit"
                    disabled={sheetInputEmpty || sheetFound || pending}
                >
                    Create
                </Button>
            </div>
        </>
    );
}
