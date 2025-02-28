import { NextRequest, NextResponse } from "next/server";

import { InflectionType } from "@models";

import { RenameInflectionResponseAPI } from "./api";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ "inflection-type": string }> },
) {
    const requestJSON = await request.json();
    const { proposedInflectionTypeName } = requestJSON;
    const inflectionTypeId = parseInt((await params)["inflection-type"]);

    try {
        await InflectionType.update(
            { typeName: proposedInflectionTypeName },
            { where: { id: inflectionTypeId } },
        );
    } catch (error) {
        console.log(`error: ${error}`);
        const body: RenameInflectionResponseAPI = {};
        return NextResponse.json(body, { status: 409 });
    }

    return new Response(null, { status: 204 });
}
