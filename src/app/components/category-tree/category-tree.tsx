"use client";

import { ReactNode } from "react";

import CategoryRow from "./category-row";
import { CategoryNode, SheetNode } from "src/app/lib/category-tree";

interface CategoryTreeProps {
    categories: CategoryNode[];
    renderSheet: (sheet: SheetNode, depth: number) => ReactNode;
    renderCategoryActions?: (category: CategoryNode) => ReactNode;
    renamingCategoryId?: number | null;
    onRenameSubmit?: (categoryId: number, newName: string) => Promise<void>;
    onRenameCancel?: () => void;
    addingAtParentId?: number | null;
    renderAddInput?: (parentId: number, depth: number) => ReactNode;
    colSpan?: number;
}

export default function CategoryTree({
    categories,
    renderSheet,
    renderCategoryActions,
    renamingCategoryId,
    onRenameSubmit,
    onRenameCancel,
    addingAtParentId,
    renderAddInput,
    colSpan,
}: CategoryTreeProps) {
    const renderCategory = (category: CategoryNode): ReactNode => {
        const hasChildren =
            category.children.length > 0 || category.sheets.length > 0;

        const isRenaming = renamingCategoryId === category.id;
        const isAddingHere = addingAtParentId === category.id;

        return (
            <CategoryRow
                key={category.id}
                categoryId={category.id}
                categoryName={category.categoryName}
                depth={category.depth}
                hasChildren={hasChildren || isAddingHere}
                renderActions={
                    renderCategoryActions && !isRenaming
                        ? () => renderCategoryActions(category)
                        : undefined
                }
                isRenaming={isRenaming}
                onRenameSubmit={
                    onRenameSubmit
                        ? (name) => onRenameSubmit(category.id, name)
                        : undefined
                }
                onRenameCancel={onRenameCancel}
                forceExpanded={isAddingHere}
                colSpan={colSpan}
            >
                {category.children.map(renderCategory)}
                {category.sheets.map((sheet) =>
                    renderSheet(sheet, category.depth + 1),
                )}
                {isAddingHere &&
                    renderAddInput &&
                    renderAddInput(category.id, category.depth + 1)}
            </CategoryRow>
        );
    };

    return <>{categories.map(renderCategory)}</>;
}
