import { NextRequest, NextResponse } from "next/server";
import { Op, Transaction } from "sequelize";

import { Category, Sheet } from "@models";

import { DeleteCategoryRequestAPI, DeleteCategoryResponseAPI } from "./api";
import { updateCategoryDepthRecursively } from "src/app/lib/update-category-depth";
import sequelize from "src/db/models/db-connection";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ category: string }> },
) {
    const categoryId = parseInt((await params).category);
    const requestJSON: DeleteCategoryRequestAPI = await request.json();
    const { orphanBehavior } = requestJSON;

    const category = await Category.findByPk(categoryId);
    if (!category) {
        const body: DeleteCategoryResponseAPI = {
            error: `Category does not exist with id ${categoryId}`,
        };
        return NextResponse.json(body, { status: 404 });
    }

    if (orphanBehavior !== "delete-all") {
        const newParentId =
            orphanBehavior === "move-to-parent"
                ? category.parentCategoryId
                : null;

        const childCategories = await Category.findAll({
            where: { parentCategoryId: categoryId },
        });

        if (childCategories.length > 0) {
            const childNames = childCategories.map((c) => c.categoryName);
            const clashes = await Category.findAll({
                where: {
                    categoryName: { [Op.in]: childNames },
                    tonguePairId: category.tonguePairId,
                    parentCategoryId: newParentId ?? null,
                    id: { [Op.ne]: categoryId },
                },
            });

            if (clashes.length > 0) {
                const names = clashes.map((c) => c.categoryName).join(", ");
                const body: DeleteCategoryResponseAPI = {
                    error: `Name clash with existing categories: ${names}`,
                };
                return NextResponse.json(body, { status: 409 });
            }
        }
    }

    try {
        await sequelize.transaction(async (t) => {
            if (orphanBehavior === "delete-all") {
                await deleteRecursively(categoryId, t);
            } else {
                const newParentId =
                    orphanBehavior === "move-to-parent"
                        ? category.parentCategoryId
                        : null;

                const newDepth =
                    orphanBehavior === "move-to-parent" ? category.depth : 0;

                const childCategories = await Category.findAll({
                    where: { parentCategoryId: categoryId },
                    transaction: t,
                });

                for (const child of childCategories) {
                    const depthDifference = newDepth - child.depth;
                    await updateCategoryDepthRecursively(
                        child.id,
                        depthDifference,
                        t,
                    );
                }

                await Category.update(
                    { parentCategoryId: newParentId },
                    {
                        where: { parentCategoryId: categoryId },
                        transaction: t,
                    },
                );

                await Sheet.update(
                    { categoryId: newParentId },
                    {
                        where: { categoryId },
                        transaction: t,
                    },
                );

                await Category.destroy({
                    where: { id: categoryId },
                    transaction: t,
                });
            }
        });
    } catch (error) {
        console.log(`error: ${error}`);
        const message =
            error instanceof Error &&
            error.name === "SequelizeUniqueConstraintError"
                ? "A category with the same name already exists in the destination."
                : "Failed to delete category.";
        const body: DeleteCategoryResponseAPI = { error: message };
        return NextResponse.json(body, { status: 409 });
    }

    return new Response(null, { status: 204 });
}

async function deleteRecursively(
    categoryId: number,
    transaction: Transaction,
): Promise<void> {
    const childCategories = await Category.findAll({
        where: { parentCategoryId: categoryId },
        transaction,
    });

    for (const child of childCategories) {
        await deleteRecursively(child.id, transaction);
    }

    await Sheet.update(
        { categoryId: null },
        {
            where: { categoryId },
            transaction,
        },
    );

    await Category.destroy({
        where: { id: categoryId },
        transaction,
    });
}
