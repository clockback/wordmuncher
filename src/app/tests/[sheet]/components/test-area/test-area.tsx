"use client";

import { useState } from "react";

import { Question, Sheet } from "@models";

import testSheetContext from "../../context";
import TestFooter from "../test-footer/test-footer";
import TestQuestion from "../test-question/test-question";
import styles from "./test-area.module.css";

interface TestAreaProps {
    initialQuestion: Question;
    sheet: Sheet;
}

export default function TestArea({ initialQuestion, sheet }: TestAreaProps) {
    const [question, setQuestion] = useState(initialQuestion);
    const [expectedAnswer, setExpectedAnswer] = useState(null);

    const context = {
        expectedAnswer,
        question,
        setExpectedAnswer,
        setQuestion,
        sheet,
    };
    return (
        <testSheetContext.Provider value={context}>
            <div className={styles.centre}>
                <div className={styles.verticalcentre}>
                    <TestQuestion></TestQuestion>
                </div>
            </div>
            <TestFooter></TestFooter>
        </testSheetContext.Provider>
    );
}
