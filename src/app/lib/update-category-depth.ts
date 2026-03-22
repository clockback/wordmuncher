import { Transaction } from "sequelize";

import { Category } from "@models";

/**
 * Recursively updates the depth of a category and all its descendants
 * by a given difference.
 */
export async function updateCategoryDepthRecursively(
    categoryId: number,
    depthDifference: number,
    transaction: Transaction,
): Promise<void> {
    const category = await Category.findByPk(categoryId, { transaction });
    if (!category) return;

    await Category.update(
        { depth: category.depth + depthDifference },
        {
            where: { id: categoryId },
            transaction,
        },
    );

    const childCategories = await Category.findAll({
        where: { parentCategoryId: categoryId },
        transaction,
    });

    for (const child of childCategories) {
        await updateCategoryDepthRecursively(
            child.id,
            depthDifference,
            transaction,
        );
    }
}
