"use client";

import { useState } from "react";

import Button from "@components/button/button";

import styles from "../move-sheet-dialog/move-sheet-dialog.module.css";
import { CategoryNode, FlatCategory } from "src/app/lib/category-tree";
import {
    MoveCategoryRequestAPI,
    MoveCategoryResponseAPI,
} from "src/app/vocab/categories/[category]/move-category/api";

interface MoveCategoryDialogProps {
    category: CategoryNode;
    categoryRoots: CategoryNode[];
    onConfirm: (categoryId: number, newParentCategoryId: number | null) => void;
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

/**
 * Collects the IDs of a category and all its descendants.
 */
function collectSelfAndDescendantIds(category: CategoryNode): Set<number> {
    const ids = new Set<number>();
    ids.add(category.id);
    function walk(nodes: CategoryNode[]) {
        for (const node of nodes) {
            ids.add(node.id);
            walk(node.children);
        }
    }
    walk(category.children);
    return ids;
}

export default function MoveCategoryDialog({
    category,
    categoryRoots,
    onConfirm,
    onCancel,
}: MoveCategoryDialogProps) {
    const [pending, setPending] = useState(false);

    const handleMove = async (parentCategoryId: number | null) => {
        setPending(true);
        const body: MoveCategoryRequestAPI = { parentCategoryId };
        const response = await fetch(
            `/vocab/categories/${category.id}/move-category`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            },
        );

        if (!response.ok) {
            const result: MoveCategoryResponseAPI = await response.json();
            alert(result.error || "Failed to move category.");
            setPending(false);
            return;
        }

        onConfirm(category.id, parentCategoryId);
    };

    const excludedIds = collectSelfAndDescendantIds(category);
    const flatCategories = flattenCategoryTree(categoryRoots).filter(
        (cat) =>
            !excludedIds.has(cat.id) && cat.id !== category.parentCategoryId,
    );

    return (
        <div className={styles.backdrop} onClick={onCancel}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.title}>
                    Move &ldquo;{category.categoryName}&rdquo;
                </div>
                <ul className={styles.categoryList}>
                    {flatCategories.map((cat) => (
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
                    {category.parentCategoryId !== null && (
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
