import { NextRequest, NextResponse } from "next/server";
import { UniqueConstraintError } from "sequelize";

import { Category } from "@models";

import { AddCategoryRequestAPI, AddCategoryResponseAPI } from "./api";
import { getSettings } from "src/db/helpers/settings";

export async function POST(request: NextRequest) {
    const settings = await getSettings();
    const requestJSON: AddCategoryRequestAPI = await request.json();
    const { categoryName, parentCategoryId } = requestJSON;

    let depth = 0;
    if (parentCategoryId !== null) {
        const parentCategory = await Category.findByPk(parentCategoryId);
        if (!parentCategory) {
            const body: AddCategoryResponseAPI = {
                success: false,
                categoryId: -1,
                error: "Parent category not found",
            };
            return NextResponse.json(body, { status: 404 });
        }
        if (parentCategory.depth >= 3) {
            const body: AddCategoryResponseAPI = {
                success: false,
                categoryId: -1,
                error: "Maximum nesting depth (4 levels) reached",
            };
            return NextResponse.json(body, { status: 400 });
        }
        depth = parentCategory.depth + 1;
    }

    const existing = await Category.findOne({
        where: {
            categoryName,
            tonguePairId: settings.tonguePairId,
            parentCategoryId: parentCategoryId ?? null,
        },
    });

    if (existing) {
        const body: AddCategoryResponseAPI = {
            success: false,
            categoryId: -1,
            error: "Category name already exists in this location",
        };
        return NextResponse.json(body, { status: 409 });
    }

    let body: AddCategoryResponseAPI;
    let status: number;

    try {
        const category = await Category.create({
            categoryName,
            tonguePairId: settings.tonguePairId,
            parentCategoryId,
            depth,
        });
        body = { success: true, categoryId: category.id };
        status = 200;
    } catch (err: unknown) {
        if (err instanceof UniqueConstraintError) {
            body = {
                success: false,
                categoryId: -1,
                error: "Category name already exists in this location",
            };
            status = 409;
        } else {
            throw err;
        }
    }

    return NextResponse.json(body, { status });
}
