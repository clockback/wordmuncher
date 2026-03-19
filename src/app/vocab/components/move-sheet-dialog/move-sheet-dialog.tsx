"use client";

import { useState } from "react";

import Button from "@components/button/button";

import styles from "./move-sheet-dialog.module.css";
import {
    CategoryNode,
    FlatCategory,
    SheetNode,
} from "src/app/lib/category-tree";
import {
    MoveSheetToCategoryRequestAPI,
    MoveSheetToCategoryResponseAPI,
} from "src/app/vocab/[sheet]/move-to-category/api";

interface MoveSheetDialogProps {
    sheet: SheetNode;
    categoryRoots: CategoryNode[];
    onConfirm: (sheetId: number, newCategoryId: number | null) => void;
    onCancel: () => void;
}

/**
 * Flattens a category tree into a DFS-ordered list,
 * preserving the hierarchical display order.
 */
function flattenCategoryTree(roots: CategoryNode[]): FlatCategory[] {
    const result: FlatCategory[] = [];
    function walk(nodes: CategoryNode[]) {
        for (const node of nodes) {
            result.push({
                id: node.id,
                categoryName: node.categoryName,
                parentCategoryId: node.parentCategoryId,
                depth: node.depth,
            });
            walk(node.children);
        }
    }
    walk(roots);
    return result;
}

export default function MoveSheetDialog({
    sheet,
    categoryRoots,
    onConfirm,
    onCancel,
}: MoveSheetDialogProps) {
    const [pending, setPending] = useState(false);

    const handleMove = async (categoryId: number | null) => {
        setPending(true);
        const body: MoveSheetToCategoryRequestAPI = { categoryId };
        const response = await fetch(
            `/vocab/${sheet.sheetId}/move-to-category`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            },
        );

        if (!response.ok) {
            const result: MoveSheetToCategoryResponseAPI =
                await response.json();
            alert(result.error || "Failed to move sheet.");
            setPending(false);
            return;
        }

        onConfirm(sheet.sheetId, categoryId);
    };

    const flatCategories = flattenCategoryTree(categoryRoots);

    return (
        <div className={styles.backdrop} onClick={onCancel}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.title}>
                    Move &ldquo;{sheet.sheetName}&rdquo;
                </div>
                <ul className={styles.categoryList}>
                    {flatCategories
                        .filter((cat) => cat.id !== sheet.categoryId)
                        .map((cat) => (
                            <li key={cat.id}>
                                <button
                                    className={styles.categoryOption}
                                    style={{
                                        paddingLeft: `${cat.depth * 16 + 12}px`,
                                    }}
                                    onClick={() => handleMove(cat.id)}
                                    disabled={pending}
                                >
                                    {cat.categoryName}
                                </button>
                            </li>
                        ))}
                </ul>
                <div className={styles.actions}>
                    {sheet.categoryId !== null && (
                        <Button
                            onClick={() => handleMove(null)}
                            disabled={pending}
                        >
                            Move to root
                        </Button>
                    )}
                    <Button onClick={onCancel} disabled={pending}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}
