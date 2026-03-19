export interface CategoryNode {
    id: number;
    categoryName: string;
    parentCategoryId: number | null;
    depth: number;
    children: CategoryNode[];
    sheets: SheetNode[];
}

export interface SheetNode {
    sheetId: number;
    sheetName: string;
    categoryId: number | null;
    progress?: number;
}

export interface CategoryTreeData {
    roots: CategoryNode[];
    uncategorizedSheets: SheetNode[];
}

export interface FlatCategory {
    id: number;
    categoryName: string;
    parentCategoryId: number | null;
    depth: number;
}

/**
 * Builds a tree structure from flat category and sheet arrays.
 * Categories are nested according to parentCategoryId relationships.
 * Sheets are attached to their respective categories.
 * Uncategorized sheets (categoryId is null) are returned separately.
 */
export function buildCategoryTree(
    categories: FlatCategory[],
    sheets: SheetNode[],
): CategoryTreeData {
    const categoryMap = new Map<number, CategoryNode>();

    for (const cat of categories) {
        categoryMap.set(cat.id, {
            id: cat.id,
            categoryName: cat.categoryName,
            parentCategoryId: cat.parentCategoryId,
            depth: cat.depth,
            children: [],
            sheets: [],
        });
    }

    const uncategorizedSheets: SheetNode[] = [];
    for (const sheet of sheets) {
        if (sheet.categoryId === null) {
            uncategorizedSheets.push(sheet);
        } else {
            const category = categoryMap.get(sheet.categoryId);
            if (category) {
                category.sheets.push(sheet);
            } else {
                uncategorizedSheets.push(sheet);
            }
        }
    }

    const roots: CategoryNode[] = [];
    for (const category of categoryMap.values()) {
        if (category.parentCategoryId === null) {
            roots.push(category);
        } else {
            const parent = categoryMap.get(category.parentCategoryId);
            if (parent) {
                parent.children.push(category);
            } else {
                roots.push(category);
            }
        }
    }

    sortCategoryTree(roots);

    return { roots, uncategorizedSheets };
}

/**
 * Recursively sorts categories and their children alphabetically by name.
 */
function sortCategoryTree(categories: CategoryNode[]): void {
    categories.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    for (const category of categories) {
        if (category.children.length > 0) {
            sortCategoryTree(category.children);
        }
        category.sheets.sort((a, b) => a.sheetName.localeCompare(b.sheetName));
    }
}

/**
 * Returns a copy of the tree with categories that have no descendant sheets removed.
 * Useful for the tests view where empty categories are irrelevant.
 */
export function pruneEmptyCategories(roots: CategoryNode[]): CategoryNode[] {
    const result: CategoryNode[] = [];
    for (const category of roots) {
        const prunedChildren = pruneEmptyCategories(category.children);
        if (prunedChildren.length > 0 || category.sheets.length > 0) {
            result.push({
                ...category,
                children: prunedChildren,
            });
        }
    }
    return result;
}

/**
 * Extracts all category IDs from a tree structure.
 * Useful for initializing expand/collapse state.
 */
export function getAllCategoryIds(roots: CategoryNode[]): number[] {
    const ids: number[] = [];
    function collect(categories: CategoryNode[]): void {
        for (const cat of categories) {
            ids.push(cat.id);
            if (cat.children.length > 0) {
                collect(cat.children);
            }
        }
    }
    collect(roots);
    return ids;
}
