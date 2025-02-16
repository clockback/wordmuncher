"use client";

import { NextResponse } from "next/server";
import { useContext, useState } from "react";

import EditableHeader from "@components/editable-header/editable-header";

import { InflectionType } from "@models";

import editInflectionContext from "../../context";
import styles from "./inflection-header.module.css";

interface InflectionHeaderProps {
    inflectionType: InflectionType;
    inflectionTypeNames: string[];
}

export default function InflectionHeader({
    inflectionType,
    inflectionTypeNames,
}: InflectionHeaderProps) {
    const { isPending, setIsPending } = useContext(editInflectionContext);

    const [inflectionName, setInflectionName] = useState<string>(
        inflectionType.typeName,
    );
    const [isEditingInflectionName, setIsEditingInflectionName] =
        useState<boolean>(false);

    const onBlurHandleResponse = (
        response: NextResponse,
        inflectionName: string,
    ) => {
        setIsPending(false);
        if (response.status !== 204) {
            console.error("Failed to rename inflection type!");
            setInflectionName(inflectionName);
            return;
        }
    };

    const onBlur = (inputText: string) => {
        if (
            inputText.length === 0 ||
            inflectionTypeNames.includes(inputText) ||
            inputText === inflectionName
        ) {
            setIsEditingInflectionName(false);
            return;
        }
        setIsEditingInflectionName(false);
        setIsPending(true);
        setInflectionName(inputText);
        fetch(`/vocab/inflections/modify/${inflectionType.id}/rename`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ proposedInflectionTypeName: inputText }),
        }).then((response: NextResponse) =>
            onBlurHandleResponse(response, inflectionName),
        );
    };

    return (
        <div className={styles.pad}>
            <EditableHeader
                currentProposal={inflectionName}
                isEditing={isEditingInflectionName}
                isPending={isPending}
                onBlur={onBlur}
                setIsEditing={setIsEditingInflectionName}
                title="Inflection"
            ></EditableHeader>
        </div>
    );
}
