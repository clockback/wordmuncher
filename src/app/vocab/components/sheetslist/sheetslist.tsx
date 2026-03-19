"use client";

import { useMemo, useState } from "react";

import Button from "@components/button/button";

import {
    DeleteCategoryRequestAPI,
    DeleteCategoryResponseAPI,
} from "../../categories/[category]/delete-category/api";
import { RenameCategoryResponseAPI } from "../../categories/[category]/rename-category/api";
import { AddCategoryResponseAPI } from "../../categories/add-category/api";
import AddCategoryInput from "../add-category-input/add-category-input";
import AddToCategoryDialog from "../add-to-category-dialog/add-to-category-dialog";
import CategoryActions from "../category-actions/category-actions";
import DeleteCategoryDialog from "../delete-category-dialog/delete-category-dialog";
import MoveSheetDialog from "../move-sheet-dialog/move-sheet-dialog";
import SheetRow from "../sheetrow/sheetrow";
import styles from "./sheetslist.module.css";
import {
    CategoryTree,
    CategoryTreeProvider,
} from "src/app/components/category-tree";
import {
    CategoryNode,
    FlatCategory,
    SheetNode,
    buildCategoryTree,
    getAllCategoryIds,
} from "src/app/lib/category-tree";

interface SheetsListProps {
    initialCategories: FlatCategory[];
    initialSheets: SheetNode[];
}

export default function SheetsList({
    initialCategories,
    initialSheets,
}: SheetsListProps) {
    const [categories, setCategories] = useState(initialCategories);
    const [sheets, setSheets] = useState(initialSheets);
    const [movingSheet, setMovingSheet] = useState<SheetNode | null>(null);
    const [addingAt, setAddingAt] = useState<{
        parentId: number | null;
        depth: number;
    } | null>(null);
    const [renamingCategoryId, setRenamingCategoryId] = useState<number | null>(
        null,
    );
    const [deletingCategory, setDeletingCategory] =
        useState<CategoryNode | null>(null);
    const [addingToCategory, setAddingToCategory] =
        useState<CategoryNode | null>(null);

    const treeData = useMemo(
        () => buildCategoryTree(categories, sheets),
        [categories, sheets],
    );

    const { roots, uncategorizedSheets } = treeData;
    const allCategoryIds = getAllCategoryIds(roots);

    const hasContent =
        roots.length > 0 || uncategorizedSheets.length > 0 || addingAt !== null;

    const handleAddCategory = async (
        name: string,
        parentCategoryId: number | null,
    ) => {
        const response = await fetch("/vocab/categories/add-category", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoryName: name, parentCategoryId }),
        });

        if (!response.ok) {
            const result: AddCategoryResponseAPI = await response.json();
            throw new Error(result.error || "Failed to create category");
        }

        const result: AddCategoryResponseAPI = await response.json();
        const depth = addingAt?.depth ?? 0;
        setCategories((prev) => [
            ...prev,
            {
                id: result.categoryId,
                categoryName: name,
                parentCategoryId,
                depth,
            },
        ]);
        setAddingAt(null);
    };

    const handleRenameCategory = async (
        categoryId: number,
        newName: string,
    ) => {
        const response = await fetch(
            `/vocab/categories/${categoryId}/rename-category`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proposedCategoryName: newName }),
            },
        );

        if (!response.ok) {
            const result: RenameCategoryResponseAPI = await response.json();
            alert(result.error || "Failed to rename category.");
            throw new Error(result.error);
        }

        setCategories((prev) =>
            prev.map((cat) =>
                cat.id === categoryId ? { ...cat, categoryName: newName } : cat,
            ),
        );
        setRenamingCategoryId(null);
    };

    const handleDeleteCategory = async (
        categoryId: number,
        orphanBehavior: DeleteCategoryRequestAPI["orphanBehavior"],
    ) => {
        const response = await fetch(
            `/vocab/categories/${categoryId}/delete-category`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orphanBehavior }),
            },
        );

        if (!response.ok) {
            const result: DeleteCategoryResponseAPI = await response.json();
            alert(result.error || "Failed to delete category.");
            throw new Error(result.error);
        }

        const deletedCategory = categories.find((c) => c.id === categoryId);
        if (!deletedCategory) return;

        if (orphanBehavior === "delete-all") {
            const idsToDelete = collectDescendantIds(categoryId, categories);
            idsToDelete.add(categoryId);
            setCategories((prev) =>
                prev.filter((cat) => !idsToDelete.has(cat.id)),
            );
        } else {
            const newParentId =
                orphanBehavior === "move-to-parent"
                    ? deletedCategory.parentCategoryId
                    : null;
            const newDepth =
                orphanBehavior === "move-to-parent" ? deletedCategory.depth : 0;

            setCategories((prev) =>
                prev
                    .filter((cat) => cat.id !== categoryId)
                    .map((cat) => {
                        if (cat.parentCategoryId === categoryId) {
                            const depthDiff = newDepth - cat.depth;
                            return {
                                ...cat,
                                parentCategoryId: newParentId,
                                depth: cat.depth + depthDiff,
                            };
                        }
                        return cat;
                    }),
            );
        }

        setDeletingCategory(null);
    };

    const handleMoveSheet = (sheetId: number, newCategoryId: number | null) => {
        setSheets((prev) =>
            prev.map((s) =>
                s.sheetId === sheetId ? { ...s, categoryId: newCategoryId } : s,
            ),
        );
        setMovingSheet(null);
    };

    const renderSheet = (sheet: SheetNode, depth: number) => (
        <SheetRow
            key={sheet.sheetId}
            href={`/vocab/${sheet.sheetId}`}
            depth={depth}
            onMove={() => setMovingSheet(sheet)}
        >
            {sheet.sheetName}
        </SheetRow>
    );

    const renderCategoryActions = (category: CategoryNode) => (
        <CategoryActions
            category={category}
            onAdd={(cat) => setAddingToCategory(cat)}
            onRename={(id) => setRenamingCategoryId(id)}
            onDelete={(cat) => setDeletingCategory(cat)}
        />
    );

    return (
        <CategoryTreeProvider allCategoryIds={allCategoryIds}>
            {hasContent && (
                <div tabIndex={-1} className={styles.tablecontainer}>
                    <table className={styles.inlinetable}>
                        <tbody>
                            <CategoryTree
                                categories={roots}
                                renderSheet={renderSheet}
                                renderCategoryActions={renderCategoryActions}
                                renamingCategoryId={renamingCategoryId}
                                onRenameSubmit={handleRenameCategory}
                                onRenameCancel={() =>
                                    setRenamingCategoryId(null)
                                }
                                addingAtParentId={
                                    addingAt?.parentId !== null
                                        ? addingAt?.parentId
                                        : undefined
                                }
                                renderAddInput={(parentId, depth) => (
                                    <AddCategoryInput
                                        key={`add-${parentId}`}
                                        parentCategoryId={parentId}
                                        depth={depth}
                                        onSubmit={handleAddCategory}
                                        onCancel={() => setAddingAt(null)}
                                    />
                                )}
                            />
                            {addingAt?.parentId === null && (
                                <AddCategoryInput
                                    key="add-root-input"
                                    parentCategoryId={null}
                                    depth={0}
                                    onSubmit={handleAddCategory}
                                    onCancel={() => setAddingAt(null)}
                                />
                            )}
                            {uncategorizedSheets.map((sheet) =>
                                renderSheet(sheet, 0),
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {deletingCategory && (
                <DeleteCategoryDialog
                    category={deletingCategory}
                    onConfirm={handleDeleteCategory}
                    onCancel={() => setDeletingCategory(null)}
                />
            )}
            {addingToCategory && (
                <AddToCategoryDialog
                    category={addingToCategory}
                    onAddSubcategory={(parentId) => {
                        setAddingToCategory(null);
                        const parent = categories.find(
                            (c) => c.id === parentId,
                        );
                        setAddingAt({
                            parentId,
                            depth: parent ? parent.depth + 1 : 0,
                        });
                    }}
                    onCancel={() => setAddingToCategory(null)}
                />
            )}
            {movingSheet && (
                <MoveSheetDialog
                    sheet={movingSheet}
                    categoryRoots={roots}
                    onConfirm={handleMoveSheet}
                    onCancel={() => setMovingSheet(null)}
                />
            )}
            <div className={styles.addCategoryRow}>
                <Button
                    onClick={() => setAddingAt({ parentId: null, depth: 0 })}
                >
                    Add category
                </Button>
            </div>
        </CategoryTreeProvider>
    );
}

function collectDescendantIds(
    parentId: number,
    categories: FlatCategory[],
): Set<number> {
    const ids = new Set<number>();
    for (const cat of categories) {
        if (cat.parentCategoryId === parentId) {
            ids.add(cat.id);
            const childIds = collectDescendantIds(cat.id, categories);
            for (const id of childIds) {
                ids.add(id);
            }
        }
    }
    return ids;
}
