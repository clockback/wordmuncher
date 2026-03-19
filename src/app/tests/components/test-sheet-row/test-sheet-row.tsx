"use client";

import clsx from "clsx";
import { useContext } from "react";

import testsContext from "../../context";
import TestDurationRow from "../test-duration-row/test-duration";
import styles from "./test-sheet-row.module.css";

interface TestSheetRowProps {
    sheet: {
        id: number;
        sheetName: string;
        progress: number;
    };
    depth?: number;
}

export default function TestSheetRow({ sheet, depth = 0 }: TestSheetRowProps) {
    const { selectedRowId, setSelectedRowId } = useContext(testsContext);

    const clickSheet = () => {
        setSelectedRowId(sheet.id);
    };

    const isSelected = selectedRowId === sheet.id;
    const style = clsx(styles.testsheetrow, { [styles.selected]: isSelected });
    const extraRow = isSelected ? (
        <TestDurationRow sheetId={sheet.id}></TestDurationRow>
    ) : null;

    const indentPx = depth * 20;

    return (
        <>
            <tr onClick={clickSheet} className={style}>
                <td style={{ paddingLeft: `${indentPx + 8}px` }}>
                    {sheet.sheetName}
                </td>
                <td>{Math.floor(sheet.progress * 100)}%</td>
            </tr>
            {extraRow}
        </>
    );
}
