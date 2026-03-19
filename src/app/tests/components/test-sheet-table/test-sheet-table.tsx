"use client";

import { useState } from "react";

import testsContext from "../../context";
import TestSheetRow from "../test-sheet-row/test-sheet-row";
import styles from "./test-sheet-table.module.css";
import {
    CategoryTree,
    CategoryTreeProvider,
} from "src/app/components/category-tree";
import {
    CategoryTreeData,
    SheetNode,
    getAllCategoryIds,
} from "src/app/lib/category-tree";

interface TestSheetTableProps {
    treeData: CategoryTreeData;
}

export default function TestSheetTable({ treeData }: TestSheetTableProps) {
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

    const { roots, uncategorizedSheets } = treeData;
    const allCategoryIds = getAllCategoryIds(roots);

    const renderSheet = (sheet: SheetNode, depth: number) => (
        <TestSheetRow
            key={sheet.sheetId}
            sheet={{
                id: sheet.sheetId,
                sheetName: sheet.sheetName,
                progress: sheet.progress ?? 0,
            }}
            depth={depth}
        />
    );

    const context = { selectedRowId, setSelectedRowId };

    return (
        <testsContext.Provider value={context}>
            <CategoryTreeProvider allCategoryIds={allCategoryIds}>
                <table className={styles.allsheets}>
                    <thead>
                        <tr>
                            <th>Sheet name</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        <CategoryTree
                            categories={roots}
                            renderSheet={renderSheet}
                            colSpan={2}
                        />
                        {uncategorizedSheets.map((sheet) =>
                            renderSheet(sheet, 0),
                        )}
                    </tbody>
                </table>
            </CategoryTreeProvider>
        </testsContext.Provider>
    );
}
