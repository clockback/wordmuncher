import { NextRequest, NextResponse } from "next/server";
import { UniqueConstraintError } from "sequelize";

import { Tongue, TonguePair } from "@models";

import { AddTongueRequestAPI, AddTongueResponseAPI } from "./api";
import { getSettings, setSettings } from "src/db/helpers/settings";

export async function POST(request: NextRequest) {
    const requestJSON: AddTongueRequestAPI = await request.json();
    const proposedName = requestJSON.proposedName;
    const flag = requestJSON.flag;
    const applyAs = requestJSON.applyAs;

    let body: AddTongueResponseAPI;
    let status: number;

    try {
        const tongue = await Tongue.create({
            tongueName: proposedName,
            flag: flag,
        });

        // Apply the newly created tongue based on context.
        if (applyAs === "native") {
            const settings = await getSettings();
            await setSettings({ nativeTongueId: tongue.id });

            // If a studying tongue is already selected,
            // find or create the new TonguePair.
            if (settings.tonguePair) {
                const [newTonguePair] = await TonguePair.findOrCreate({
                    where: {
                        nativeTongueId: tongue.id,
                        studyingTongueId: settings.tonguePair.studyingTongueId,
                    },
                });
                await setSettings({ tonguePairId: newTonguePair.id });
            }
        } else if (applyAs === "studying") {
            const settings = await getSettings();
            const nativeTongueId = settings.nativeTongueId;
            const [newTonguePair] = await TonguePair.findOrCreate({
                where: {
                    nativeTongueId: nativeTongueId,
                    studyingTongueId: tongue.id,
                },
            });
            await setSettings({ tonguePairId: newTonguePair.id });
        }

        body = { success: true, tongueId: tongue.id };
        status = 200;
    } catch (err: unknown) {
        if (err instanceof UniqueConstraintError) {
            body = { success: false, tongueId: -1 };
            status = 409;
        } else {
            throw err;
        }
    }

    return NextResponse.json(body, { status });
}
