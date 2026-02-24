import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";

import { Sheet, Tongue, TonguePair } from "@models";

import { getSettings } from "src/db/helpers/settings";

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ tongue: string }> },
) {
    const tongueId = parseInt((await params).tongue);

    const tongue = await Tongue.findByPk(tongueId);
    if (!tongue) {
        return NextResponse.json(
            { error: "Language not found." },
            { status: 404 },
        );
    }

    // Prevent deletion if this is the user's current native tongue.
    const settings = await getSettings();
    if (settings.nativeTongueId === tongueId) {
        return NextResponse.json(
            { error: "Cannot delete your current native language." },
            { status: 409 },
        );
    }

    // Prevent deletion if this is part of the user's current studying pair.
    if (settings.tonguePair) {
        if (
            settings.tonguePair.studyingTongueId === tongueId ||
            settings.tonguePair.nativeTongueId === tongueId
        ) {
            return NextResponse.json(
                { error: "Cannot delete a language in your current pair." },
                { status: 409 },
            );
        }
    }

    // Prevent deletion if any tongue pair referencing this tongue has sheets.
    const pairs = await TonguePair.findAll({
        where: {
            [Op.or]: [
                { nativeTongueId: tongueId },
                { studyingTongueId: tongueId },
            ],
        },
    });

    for (const pair of pairs) {
        const sheetCount = await Sheet.count({
            where: { tonguePairId: pair.id },
        });
        if (sheetCount > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete a language that has vocabulary sheets.",
                },
                { status: 409 },
            );
        }
    }

    await Tongue.destroy({ where: { id: tongueId } });

    return NextResponse.json({}, { status: 200 });
}
