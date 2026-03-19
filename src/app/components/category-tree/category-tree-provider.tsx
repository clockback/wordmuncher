"use client";

import { ReactNode, useCallback, useState } from "react";

import categoryTreeContext, {
    CategoryTreeContextType,
} from "./category-tree-context";

interface CategoryTreeProviderProps {
    children: ReactNode;
    allCategoryIds: number[];
    initialExpandedIds?: number[];
}

export default function CategoryTreeProvider({
    children,
    allCategoryIds,
    initialExpandedIds = [],
}: CategoryTreeProviderProps) {
    const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<number>>(
        new Set(initialExpandedIds),
    );

    const toggleCategory = useCallback((categoryId: number) => {
        setExpandedCategoryIds((prev) => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    }, []);

    const expandAll = useCallback(() => {
        setExpandedCategoryIds(new Set(allCategoryIds));
    }, [allCategoryIds]);

    const collapseAll = useCallback(() => {
        setExpandedCategoryIds(new Set());
    }, []);

    const context: CategoryTreeContextType = {
        expandedCategoryIds,
        toggleCategory,
        expandAll,
        collapseAll,
    };

    return (
        <categoryTreeContext.Provider value={context}>
            {children}
        </categoryTreeContext.Provider>
    );
}
