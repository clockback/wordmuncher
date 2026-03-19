"use client";

import Button from "@components/button/button";

import styles from "./add-to-category-dialog.module.css";
import { CategoryNode } from "src/app/lib/category-tree";

interface AddToCategoryDialogProps {
    category: CategoryNode;
    onAddSubcategory: (parentId: number) => void;
    onCancel: () => void;
}

export default function AddToCategoryDialog({
    category,
    onAddSubcategory,
    onCancel,
}: AddToCategoryDialogProps) {
    const canAddSubcategory = category.depth < 3;

    return (
        <div className={styles.backdrop} onClick={onCancel}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.title}>
                    Add to &ldquo;{category.categoryName}&rdquo;
                </div>
                <div className={styles.buttons}>
                    {canAddSubcategory && (
                        <Button onClick={() => onAddSubcategory(category.id)}>
                            Add subcategory
                        </Button>
                    )}
                    <Button href={`/vocab/add-sheet?categoryId=${category.id}`}>
                        Add sheet
                    </Button>
                    <Button onClick={onCancel}>Cancel</Button>
                </div>
            </div>
        </div>
    );
}
