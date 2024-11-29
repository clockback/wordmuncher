"use server";

import { getSettings, setSettings } from "src/db/helpers/settings";
import TongueSelector from "./tongueselector";
import TonguePair from "@models/tonguepair";
import Tongue from "@models/tongue";

async function pickTongue(tongueId: number): Promise<TonguePair> {
    "use server";

    const oldTonguePair = (await getSettings()).tonguePair;
    let newTonguePair: TonguePair;

    // If there is no tongue pair currently, creates one.
    if (oldTonguePair === null) {
        newTonguePair = await TonguePair.create({
            translateFromTongueId: 1,
            translateToTongueId: tongueId,
        });
    }

    // If there is a tongue pair, swaps the tongues.
    else {
        const [createdTonguePair, created] = await TonguePair.findOrCreate({
            where: {
                translateFromTongueId: oldTonguePair.translateFromTongueId,
                translateToTongueId: tongueId,
            },
        });
        newTonguePair = createdTonguePair;
    }

    setSettings({ tonguePair: newTonguePair });
    return newTonguePair;
}

async function pickTongueAndGetBack(
    tongueId: number,
): Promise<{ id: number; tongueName: string; flag: string }> {
    "use server";

    let tonguePair = await pickTongue(tongueId);
    let translateToTongue = await tonguePair.translateToTongue();
    return {
        id: translateToTongue.id,
        tongueName: translateToTongue.tongueName,
        flag: translateToTongue.flag,
    };
}

async function fetchAllTongues(): Promise<
    { id: number; tongueName: string; flag: string }[]
> {
    "use server";
    let allTongues = await Tongue.findAll({
        attributes: ["id", "tongueName", "flag"],
    });
    let tongueJSON = [];
    for (let tongue of allTongues) {
        tongueJSON.push(tongue.toJSON());
    }

    return tongueJSON;
}

export default async function Home() {
    const allTongues = await fetchAllTongues();
    const settings = await getSettings();
    const tonguePair = settings.tonguePair;
    const initialTongueModel = tonguePair ? tonguePair.translateTo : null;
    const initialTongue = initialTongueModel
        ? {
              id: initialTongueModel.id,
              tongueName: initialTongueModel.tongueName,
              flag: initialTongueModel.flag,
          }
        : null;

    return (
        <TongueSelector
            onChangeTongue={pickTongueAndGetBack}
            allTongues={allTongues}
            initialTongue={initialTongue}
        ></TongueSelector>
    );
}
