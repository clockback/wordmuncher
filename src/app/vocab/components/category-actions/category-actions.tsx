"use client";

import styles from "./category-actions.module.css";
import { CategoryNode } from "src/app/lib/category-tree";

interface CategoryActionsProps {
    category: CategoryNode;
    onAdd: (category: CategoryNode) => void;
    onRename: (categoryId: number) => void;
    onDelete: (category: CategoryNode) => void;
}

export default function CategoryActions({
    category,
    onAdd,
    onRename,
    onDelete,
}: CategoryActionsProps) {
    return (
        <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
            <button
                className={styles.actionButton}
                onClick={() => onAdd(category)}
                title="Add to category"
            >
                +
            </button>
            <button
                className={styles.actionButton}
                onClick={() => onRename(category.id)}
                title="Rename category"
            >
                ✎
            </button>
            <button
                className={styles.actionButton}
                onClick={() => onDelete(category)}
                title="Delete category"
            >
                ×
            </button>
        </div>
    );
}
