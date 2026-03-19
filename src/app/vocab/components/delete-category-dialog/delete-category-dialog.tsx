"use client";

import { useState } from "react";

import Button from "@components/button/button";

import styles from "./delete-category-dialog.module.css";
import { CategoryNode } from "src/app/lib/category-tree";
import { DeleteCategoryRequestAPI } from "src/app/vocab/categories/[category]/delete-category/api";

interface DeleteCategoryDialogProps {
    category: CategoryNode;
    onConfirm: (
        categoryId: number,
        orphanBehavior: DeleteCategoryRequestAPI["orphanBehavior"],
    ) => Promise<void>;
    onCancel: () => void;
}

export default function DeleteCategoryDialog({
    category,
    onConfirm,
    onCancel,
}: DeleteCategoryDialogProps) {
    const [pending, setPending] = useState(false);
    const isEmpty =
        category.children.length === 0 && category.sheets.length === 0;

    const handleConfirm = async (
        behavior: DeleteCategoryRequestAPI["orphanBehavior"],
    ) => {
        setPending(true);
        try {
            await onConfirm(category.id, behavior);
        } catch {
            setPending(false);
        }
    };

    return (
        <div className={styles.backdrop} onClick={onCancel}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.title}>
                    Delete &ldquo;{category.categoryName}&rdquo;?
                </div>
                <div className={styles.buttons}>
                    {isEmpty ? (
                        <Button
                            onClick={() => handleConfirm("move-to-parent")}
                            disabled={pending}
                        >
                            Delete empty category
                        </Button>
                    ) : (
                        <>
                            {category.parentCategoryId !== null && (
                                <Button
                                    onClick={() =>
                                        handleConfirm("move-to-parent")
                                    }
                                    disabled={pending}
                                >
                                    Move contents to parent
                                </Button>
                            )}
                            <Button
                                onClick={() => handleConfirm("move-to-root")}
                                disabled={pending}
                            >
                                Move contents to root
                            </Button>
                            <Button
                                onClick={() => handleConfirm("delete-all")}
                                disabled={pending}
                            >
                                Delete everything inside
                            </Button>
                        </>
                    )}
                    <Button onClick={onCancel} disabled={pending}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}
