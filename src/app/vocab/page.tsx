import { notFound } from "next/navigation";

import { Settings, Tongue, TonguePair } from "@models";

import TongueSelector from "./components/tongueselector/tongueselector";
import styles from "./vocab.module.css";
import { getSettings, setSettings } from "src/db/helpers/settings";

async function pickTongue(tongueId: number): Promise<TonguePair> {
    "use server";

    const oldTonguePair = (await getSettings()).tonguePair;
    let newTonguePair: TonguePair;

    // If there is no tongue pair currently, creates one.
    if (oldTonguePair === null) {
        newTonguePair = await TonguePair.create({
            nativeTongueId: 1,
            studyingTongueId: tongueId,
        });
    }

    // If there is a tongue pair, swaps the tongues.
    else {
        const [createdTonguePair] = await TonguePair.findOrCreate({
            where: {
                nativeTongueId: oldTonguePair.nativeTongueId,
                studyingTongueId: tongueId,
            },
        });
        newTonguePair = createdTonguePair;
    }

    setSettings({ tonguePair: newTonguePair });
    return newTonguePair;
}

async function getTonguePairSheetsAsJson(
    tonguePair: TonguePair,
): Promise<{ sheetId: number; sheetName: string }[]> {
    const sheets = [];
    for (const sheet of await tonguePair.getSheets()) {
        sheets.push({ sheetId: sheet.id, sheetName: sheet.sheetName });
    }
    return sheets;
}

async function pickTongueAndGetBack(tongueId: number): Promise<{
    id: number;
    tongueName: string;
    flag: string;
    sheets: { sheetId: number; sheetName: string }[];
}> {
    "use server";

    const tonguePair = await pickTongue(tongueId);
    const studyingTongue = await tonguePair.studyingTongue();
    const sheets = await getTonguePairSheetsAsJson(tonguePair);
    return {
        id: studyingTongue.id,
        tongueName: studyingTongue.tongueName,
        flag: studyingTongue.flag,
        sheets: sheets,
    };
}

async function fetchAllTongues(): Promise<
    { id: number; tongueName: string; flag: string }[]
> {
    "use server";
    const allTongues = await Tongue.findAll({
        attributes: ["id", "tongueName", "flag"],
    });
    const tongueJSON = [];
    for (const tongue of allTongues) {
        tongueJSON.push(tongue.toJSON());
    }

    return tongueJSON;
}

export default async function Home() {
    let allTongues: { id: number; tongueName: string; flag: string }[];
    let settings: Settings;
    let tonguePair: TonguePair;
    let sheets: { sheetName: string; sheetId: number }[];
    try {
        allTongues = await fetchAllTongues();
        settings = await getSettings();
        tonguePair = settings.tonguePair;
        sheets = tonguePair ? await getTonguePairSheetsAsJson(tonguePair) : [];
    } catch {
        return notFound();
    }
    const initialTongueModel = tonguePair ? tonguePair.studying : null;
    const initialTongue = initialTongueModel
        ? {
              id: initialTongueModel.id,
              tongueName: initialTongueModel.tongueName,
              flag: initialTongueModel.flag,
              sheets: sheets,
          }
        : null;

    return (
        <div className={styles.centre}>
            <TongueSelector
                onChangeTongue={pickTongueAndGetBack}
                allTongues={allTongues}
                initialTongue={initialTongue}
            ></TongueSelector>
        </div>
    );
}

export const dynamic = "force-dynamic";
