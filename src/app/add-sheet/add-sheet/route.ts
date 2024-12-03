import { NextRequest, NextResponse } from "next/server";
import { UniqueConstraintError } from "sequelize";

import { Sheet } from "@models";

import { getSettings } from "src/db/helpers/settings";

export async function POST(request: NextRequest) {
    const settings = await getSettings();
    const proposedName = (await request.json()).proposedName;
    try {
        await Sheet.create({
            sheetName: proposedName,
            tonguePairId: settings.tonguePairId,
        });
    } catch (err: unknown) {
        if (err instanceof UniqueConstraintError) {
            return NextResponse.json({ success: false }, { status: 409 });
        } else {
            throw err;
        }
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
