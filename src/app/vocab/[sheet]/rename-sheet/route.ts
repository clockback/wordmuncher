import { NextRequest, NextResponse } from "next/server";

import { Sheet } from "@models";

import { RenameSheetResponseAPI } from "./api";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ sheet: string }> },
) {
    const requestJSON = await request.json();
    const { proposedSheetName } = requestJSON;
    const sheetId = parseInt((await params).sheet);

    try {
        await Sheet.update(
            { sheetName: proposedSheetName },
            { where: { id: sheetId } },
        );
    } catch (error) {
        console.log(`error: ${error}`);
        const body: RenameSheetResponseAPI = {};
        return NextResponse.json(body, { status: 409 });
    }

    return new Response(null, { status: 204 });
}
