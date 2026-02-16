"use client";

import { NextResponse } from "next/server";
import { useContext, useState } from "react";

import EditableHeader from "@components/editable-header/editable-header";

import editSheetContext from "../../context";
import { RenameSheetRequestAPI } from "../../rename-sheet/api";
import styles from "./edit-sheet-header.module.css";

interface EditSheetHeaderProps {
    sheetId: number;
    otherSheetNames: string[];
}

export default function EditSheetHeader({
    sheetId,
    otherSheetNames,
}: EditSheetHeaderProps) {
    const { pending, setPending, sheetName, setSheetName } =
        useContext(editSheetContext);

    const [isEditingSheetName, setIsEditingSheetName] =
        useState<boolean>(false);

    const onBlurHandleResponse = (
        response: NextResponse,
        previousSheetName: string,
    ) => {
        setPending(false);
        if (!response.ok) {
            console.error("Failed to rename sheet!");
            setSheetName(previousSheetName);
            return;
        }
    };

    const onBlur = (inputText: string) => {
        if (
            inputText.length === 0 ||
            otherSheetNames.includes(inputText) ||
            inputText === sheetName
        ) {
            setIsEditingSheetName(false);
            return;
        }
        setIsEditingSheetName(false);
        setPending(true);
        const previousSheetName = sheetName;
        setSheetName(inputText);
        const body: RenameSheetRequestAPI = {
            proposedSheetName: inputText,
        };
        fetch(`/vocab/${sheetId}/rename-sheet`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).then((response: NextResponse) =>
            onBlurHandleResponse(response, previousSheetName),
        );
    };

    return (
        <div className={styles.header}>
            <EditableHeader
                currentProposal={sheetName}
                isEditing={isEditingSheetName}
                isPending={pending}
                onBlur={onBlur}
                setIsEditing={setIsEditingSheetName}
                title="Sheet"
            />
        </div>
    );
}
