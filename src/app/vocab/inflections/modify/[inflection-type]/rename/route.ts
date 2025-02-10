import { NextRequest, NextResponse } from "next/server";

import { InflectionType } from "@models";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ "inflection-type": string }> },
) {
    const requestJSON = await request.json();
    const proposedInflectionTypeName = requestJSON.proposedInflectionTypeName;
    const inflectionTypeId = parseInt((await params)["inflection-type"]);

    try {
        await InflectionType.update(
            { typeName: proposedInflectionTypeName },
            { where: { id: inflectionTypeId } },
        );
    } catch (error) {
        console.log(`error: ${error}`);
        return NextResponse.json({}, { status: 409 });
    }

    return new Response(null, { status: 204 });
}
