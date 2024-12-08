import Button from "@components/button/button";
import Flag from "@components/flag/flag";

import { Sheet } from "@models";

import styles from "./add-sheet.module.css";
import SheetNameInput from "./components/sheet-name-input/sheet-name-input";
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
    const studying = await currentTonguePair.studyingTongue();
    return (
        <div className={styles.centrecontent}>
            <div className={styles.centreheader}>
                New sheet for {studying.tongueName}...
            </div>
            <Flag flag={studying.flag}></Flag>
            <div className={styles.padinput}>
                <SheetNameInput onChange={validateSheetName}></SheetNameInput>
            </div>
            <Button>Create</Button>
        </div>
    );
}
