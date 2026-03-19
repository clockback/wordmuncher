import { NextRequest, NextResponse } from "next/server";

import { Category } from "@models";

import { RenameCategoryResponseAPI } from "./api";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ category: string }> },
) {
    const requestJSON = await request.json();
    const { proposedCategoryName } = requestJSON;
    const categoryId = parseInt((await params).category);

    const category = await Category.findByPk(categoryId);
    if (!category) {
        const body: RenameCategoryResponseAPI = {
            error: "Category not found",
        };
        return NextResponse.json(body, { status: 404 });
    }

    const existing = await Category.findOne({
        where: {
            categoryName: proposedCategoryName,
            tonguePairId: category.tonguePairId,
            parentCategoryId: category.parentCategoryId ?? null,
        },
    });

    if (existing && existing.id !== categoryId) {
        const body: RenameCategoryResponseAPI = {
            error: "Category name already exists in this location",
        };
        return NextResponse.json(body, { status: 409 });
    }

    try {
        await Category.update(
            { categoryName: proposedCategoryName },
            { where: { id: categoryId } },
        );
    } catch (error) {
        console.log(`error: ${error}`);
        const body: RenameCategoryResponseAPI = {
            error: "Failed to rename category",
        };
        return NextResponse.json(body, { status: 409 });
    }

    return new Response(null, { status: 204 });
}
