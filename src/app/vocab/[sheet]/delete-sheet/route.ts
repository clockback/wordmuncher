import { NextRequest, NextResponse } from "next/server";

import { Sheet } from "@models";

import { DeleteSheetResponseAPI } from "./api";

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ sheet: string }> },
) {
    const sheet = parseInt((await params).sheet);
    const noDeleted = await Sheet.destroy({ where: { id: sheet } });

    let body: DeleteSheetResponseAPI;
    let status: number;

    if (noDeleted === 0) {
        body = { error: `Sheet does not exist with id ${sheet}` };
        status = 409;
    } else {
        body = {};
        status = 200;
    }

    return NextResponse.json(body, { status });
}
