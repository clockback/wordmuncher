import { NextRequest, NextResponse } from "next/server";

import { Category } from "@models";

import { MoveCategoryRequestAPI, MoveCategoryResponseAPI } from "./api";
import { updateCategoryDepthRecursively } from "src/app/lib/update-category-depth";
import sequelize from "src/db/models/db-connection";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ category: string }> },
) {
    const categoryId = parseInt((await params).category);
    const requestJSON: MoveCategoryRequestAPI = await request.json();
    const { parentCategoryId: newParentId } = requestJSON;

    const category = await Category.findByPk(categoryId);
    if (!category) {
        const body: MoveCategoryResponseAPI = {
            error: "Category not found",
        };
        return NextResponse.json(body, { status: 404 });
    }

    if (newParentId === category.parentCategoryId) {
        return new Response(null, { status: 204 });
    }

    let newDepth = 0;

    if (newParentId !== null) {
        if (newParentId === categoryId) {
            const body: MoveCategoryResponseAPI = {
                error: "Cannot move a category into itself",
            };
            return NextResponse.json(body, { status: 400 });
        }

        const newParent = await Category.findByPk(newParentId);
        if (!newParent) {
            const body: MoveCategoryResponseAPI = {
                error: "Target category not found",
            };
            return NextResponse.json(body, { status: 404 });
        }

        if (await isDescendantOf(newParentId, categoryId)) {
            const body: MoveCategoryResponseAPI = {
                error: "Cannot move a category into its own descendant",
            };
            return NextResponse.json(body, { status: 400 });
        }

        newDepth = newParent.depth + 1;
        const maxDescendantDepth = await getMaxDescendantDepth(categoryId);
        const depthDifference = newDepth - category.depth;

        if (maxDescendantDepth + depthDifference > 3) {
            const body: MoveCategoryResponseAPI = {
                error: "Moving here would exceed the maximum nesting depth (4 levels)",
            };
            return NextResponse.json(body, { status: 400 });
        }
    }

    const nameClash = await Category.findOne({
        where: {
            categoryName: category.categoryName,
            tonguePairId: category.tonguePairId,
            parentCategoryId: newParentId ?? null,
        },
    });

    if (nameClash && nameClash.id !== categoryId) {
        const body: MoveCategoryResponseAPI = {
            error: `A category named "${category.categoryName}" already exists at the destination`,
        };
        return NextResponse.json(body, { status: 409 });
    }

    const depthDifference = newDepth - category.depth;

    try {
        await sequelize.transaction(async (t) => {
            await Category.update(
                { parentCategoryId: newParentId, depth: newDepth },
                { where: { id: categoryId }, transaction: t },
            );

            const children = await Category.findAll({
                where: { parentCategoryId: categoryId },
                transaction: t,
            });

            for (const child of children) {
                await updateCategoryDepthRecursively(
                    child.id,
                    depthDifference,
                    t,
                );
            }
        });
    } catch (error) {
        console.error(`error: ${error}`);
        const body: MoveCategoryResponseAPI = {
            error: "Failed to move category",
        };
        return NextResponse.json(body, { status: 409 });
    }

    return new Response(null, { status: 204 });
}

/**
 * Checks whether `candidateId` is a descendant of `ancestorId`.
 */
async function isDescendantOf(
    candidateId: number,
    ancestorId: number,
): Promise<boolean> {
    const children = await Category.findAll({
        where: { parentCategoryId: ancestorId },
    });

    for (const child of children) {
        if (child.id === candidateId) return true;
        if (await isDescendantOf(candidateId, child.id)) return true;
    }

    return false;
}

/**
 * Returns the maximum depth among a category and all its descendants.
 */
async function getMaxDescendantDepth(categoryId: number): Promise<number> {
    const category = await Category.findByPk(categoryId);
    if (!category) return 0;

    let maxDepth = category.depth;

    const children = await Category.findAll({
        where: { parentCategoryId: categoryId },
    });

    for (const child of children) {
        const childMax = await getMaxDescendantDepth(child.id);
        if (childMax > maxDepth) maxDepth = childMax;
    }

    return maxDepth;
}
