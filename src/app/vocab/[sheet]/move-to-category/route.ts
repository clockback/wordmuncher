import { NextRequest, NextResponse } from "next/server";

import { Category, Sheet } from "@models";

import {
    MoveSheetToCategoryRequestAPI,
    MoveSheetToCategoryResponseAPI,
} from "./api";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ sheet: string }> },
) {
    const sheetId = parseInt((await params).sheet);
    const requestJSON: MoveSheetToCategoryRequestAPI = await request.json();
    const { categoryId } = requestJSON;

    if (categoryId !== null) {
        const category = await Category.findByPk(categoryId);
        if (!category) {
            const body: MoveSheetToCategoryResponseAPI = {
                error: "Category not found",
            };
            return NextResponse.json(body, { status: 404 });
        }
    }

    try {
        await Sheet.update({ categoryId }, { where: { id: sheetId } });
    } catch (error) {
        console.log(`error: ${error}`);
        const body: MoveSheetToCategoryResponseAPI = {
            error: "Failed to move sheet",
        };
        return NextResponse.json(body, { status: 409 });
    }

    return new Response(null, { status: 204 });
}
