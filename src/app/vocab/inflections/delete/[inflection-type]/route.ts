import { NextRequest } from "next/server";

import { InflectionType } from "@models";

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ "inflection-type": string }> },
) {
    const inflectionTypeId = parseInt((await params)["inflection-type"]);

    await InflectionType.destroy({ where: { id: inflectionTypeId } });

    return new Response(null, { status: 204 });
}
