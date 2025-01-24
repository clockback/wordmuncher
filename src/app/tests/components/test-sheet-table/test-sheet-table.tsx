"use client";

import { useState } from "react";

import testsContext from "../../context";
import TestSheetRow from "../test-sheet-row/test-sheet-row";
import styles from "./test-sheet-table.module.css";

interface TestSheetTableProps {
    sheets: { id: number; sheetName: string; progress: number }[];
}

export default function TestSheetTable({ sheets }: TestSheetTableProps) {
    const [selectedRowId, setSelectedRowId] = useState(null);

    const tableRows = [];
    for (const sheet of sheets) {
        tableRows.push(
            <TestSheetRow key={sheet.id} sheet={sheet}></TestSheetRow>,
        );
    }

    const context = { selectedRowId, setSelectedRowId };

    return (
        <testsContext.Provider value={context}>
            <table className={styles.allsheets}>
                <thead>
                    <tr>
                        <th>Sheet name</th>
                        <th>Progress</th>
                    </tr>
                </thead>
                <tbody>{tableRows}</tbody>
            </table>
        </testsContext.Provider>
    );
}
