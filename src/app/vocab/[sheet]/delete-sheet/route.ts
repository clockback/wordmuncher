import { NextRequest, NextResponse } from "next/server";

import { Sheet } from "@models";

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ sheet: string }> },
) {
    const sheet = parseInt((await params).sheet);
    const noDeleted = await Sheet.destroy({ where: { id: sheet } });

    if (noDeleted === 0) {
        return NextResponse.json(
            { error: `Sheet does not exist with id ${sheet}` },
            { status: 409 },
        );
    }

    return NextResponse.json({}, { status: 200 });
}
