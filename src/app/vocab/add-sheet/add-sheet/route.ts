import { NextRequest, NextResponse } from "next/server";
import { UniqueConstraintError } from "sequelize";

import { Sheet } from "@models";

import { AddSheetRequestAPI, AddSheetResponseAPI } from "./api";
import { getSettings } from "src/db/helpers/settings";

export async function POST(request: NextRequest) {
    const settings = await getSettings();
    const requestJSON: AddSheetRequestAPI = await request.json();
    const proposedName = requestJSON.proposedName;

    let body: AddSheetResponseAPI;
    let status: number;

    try {
        const sheet = await Sheet.create({
            sheetName: proposedName,
            tonguePairId: settings.tonguePairId,
        });
        body = { success: true, sheetId: sheet.id };
        status = 200;
    } catch (err: unknown) {
        if (err instanceof UniqueConstraintError) {
            body = { success: false, sheetId: -1 };
            status = 409;
        } else {
            throw err;
        }
    }

    return NextResponse.json(body, { status });
}
