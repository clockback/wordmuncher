import { notFound } from "next/navigation";

import { Tongue, TonguePair } from "@models";

import NativeTongueSelector from "./components/native-tongue-selector/native-tongue-selector";
import styles from "./settings.module.css";
import { getSettings, setSettings } from "src/db/helpers/settings";

async function changeNativeTongue(tongueId: number): Promise<{
    id: number;
    tongueName: string;
    flag: string;
}> {
    "use server";

    const settings = await getSettings();

    // Update nativeTongueId in settings.
    await setSettings({ nativeTongueId: tongueId });

    // If a studying tongue is already selected via the current tonguePair,
    // find or create a new TonguePair with the new native + existing studying,
    // and update settings.tonguePairId.
    if (settings.tonguePair) {
        const studyingTongueId = settings.tonguePair.studyingTongueId;
        const [newTonguePair] = await TonguePair.findOrCreate({
            where: {
                nativeTongueId: tongueId,
                studyingTongueId: studyingTongueId,
            },
        });
        await setSettings({ tonguePairId: newTonguePair.id });
    }

    const tongue = await Tongue.findByPk(tongueId);
    return {
        id: tongue.id,
        tongueName: tongue.tongueName,
        flag: tongue.flag,
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

export default async function SettingsPage() {
    let allTongues: { id: number; tongueName: string; flag: string }[];
    let initialNativeTongue: {
        id: number;
        tongueName: string;
        flag: string;
    };
    try {
        allTongues = await fetchAllTongues();
        const settings = await getSettings();
        const nativeTongue = settings.nativeTongue;
        initialNativeTongue = {
            id: nativeTongue.id,
            tongueName: nativeTongue.tongueName,
            flag: nativeTongue.flag,
        };
    } catch (error) {
        console.error("Failed to load settings page:", error);
        return notFound();
    }

    return (
        <div className={styles.centre}>
            <NativeTongueSelector
                onChangeNativeTongue={changeNativeTongue}
                allTongues={allTongues}
                initialNativeTongue={initialNativeTongue}
            ></NativeTongueSelector>
        </div>
    );
}

export const dynamic = "force-dynamic";
