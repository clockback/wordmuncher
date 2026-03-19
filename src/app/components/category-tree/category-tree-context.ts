import { createContext } from "react";

export interface CategoryTreeContextType {
    expandedCategoryIds: Set<number>;
    toggleCategory: (categoryId: number) => void;
    expandAll: () => void;
    collapseAll: () => void;
}

const categoryTreeContext = createContext<CategoryTreeContextType | undefined>(
    undefined,
);

export default categoryTreeContext;
