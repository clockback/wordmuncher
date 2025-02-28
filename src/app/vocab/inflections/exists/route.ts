import { NextRequest, NextResponse } from "next/server";

import { InflectionType } from "@models";

import { InterfaceExistsResponseAPI } from "./api";
import { getSettings } from "src/db/helpers/settings";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const tonguePairId = (await getSettings()).tonguePairId;
    const inflectionType = await InflectionType.findOne({
        where: {
            typeName: searchParams.get("inflection-type-name"),
            tonguePairId,
        },
    });

    const body: InterfaceExistsResponseAPI = {
        exists: inflectionType !== null,
    };
    return NextResponse.json(body, { status: 200 });
}
