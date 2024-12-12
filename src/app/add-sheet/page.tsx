import { notFound } from "next/navigation";

import Flag from "@components/flag/flag";

import { Sheet } from "@models";

import styles from "./add-sheet.module.css";
import AddSheetForm from "./components/add-sheet-form/add-sheet-form";
import { getSettings } from "src/db/helpers/settings";

async function validateSheetName(sheetName: string): Promise<boolean> {
    "use server";

    const settings = await getSettings();
    const sheet = await Sheet.findOne({
        where: {
            sheetName: sheetName,
            tonguePairId: settings.tonguePairId,
        },
    });

    return sheet !== null;
}

export default async function Page() {
    const settings = await getSettings();
    const currentTonguePair = settings.tonguePair;
    if (!currentTonguePair) {
        return notFound();
    }

    const studying = await currentTonguePair.studyingTongue();
    return (
        <div className={styles.centrecontent}>
            <div className={styles.centreheader}>
                New sheet for {studying.tongueName}...
            </div>
            <Flag flag={studying.flag}></Flag>
            <AddSheetForm validateSheetName={validateSheetName} />
        </div>
    );
}
