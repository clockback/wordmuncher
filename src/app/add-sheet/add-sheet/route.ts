import { NextRequest, NextResponse } from "next/server";
import { UniqueConstraintError } from "sequelize";

import { Sheet } from "@models";

import { getSettings } from "src/db/helpers/settings";

export async function POST(request: NextRequest) {
    const settings = await getSettings();
    const proposedName = (await request.json()).proposedName;
    let sheetId: number = -1;
    try {
        const sheet = await Sheet.create({
            sheetName: proposedName,
            tonguePairId: settings.tonguePairId,
        });
        sheetId = sheet.id;
    } catch (err: unknown) {
        if (err instanceof UniqueConstraintError) {
            return NextResponse.json(
                { success: false, sheetId: -1 },
                { status: 409 },
            );
        } else {
            throw err;
        }
    }

    return NextResponse.json(
        { success: true, sheetId: sheetId },
        { status: 200 },
    );
}
