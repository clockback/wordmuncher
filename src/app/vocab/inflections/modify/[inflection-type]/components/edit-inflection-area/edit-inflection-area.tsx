"use client";

import { useState } from "react";

import Button from "@components/button/button";
import InflectionTemplate from "@components/inflection-template/inflection-template";

import { InflectionType, Question } from "@models";

import editInflectionContext from "../../context";
import InflectionHeader from "../inflection-header/inflection-header";
import styles from "./edit-inflection-area.module.css";

interface EditInflectionAreaProps {
    inflectionType: InflectionType;
    otherInflectionNames: string[];
    representativeQuestion: Question | null;
}

export default function EditInflectionArea({
    inflectionType,
    otherInflectionNames,
    representativeQuestion,
}: EditInflectionAreaProps) {
    const [isPending, setIsPending] = useState(false);
    const context = { isPending, setIsPending };

    return (
        <editInflectionContext.Provider value={context}>
            <InflectionHeader
                inflectionType={inflectionType}
                inflectionTypeNames={otherInflectionNames}
            ></InflectionHeader>
            <div style={{ textAlign: "center" }}>
                <InflectionTemplate
                    inflectionType={inflectionType}
                    representativeQuestion={representativeQuestion}
                ></InflectionTemplate>
                <div className={styles.buttonmargin}>
                    <Button href="/vocab/inflections">Back</Button>
                </div>
            </div>
        </editInflectionContext.Provider>
    );
}
