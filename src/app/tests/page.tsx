import { notFound } from "next/navigation";

import { Question, Result, Sheet } from "@models";

import TestSheetTable from "./components/test-sheet-table/test-sheet-table";
import styles from "./tests.module.css";
import { getSettings } from "src/db/helpers/settings";

async function getAllSheets(): Promise<Sheet[]> {
    "use server";
    const settings = await getSettings();

    return await Sheet.findAll({
        where: { tonguePairId: settings.tonguePairId },
        include: [
            {
                model: Question,
                as: "questions",
                include: [{ model: Result, as: "result" }],
            },
        ],
    });
}

async function getSheetsByProgress(): Promise<
    { id: number; sheetName: string; progress: number }[]
> {
    "use server";
    const sheetsWithoutProgress = await getAllSheets();
    const sheets = [];
    for (const sheet of sheetsWithoutProgress) {
        let progressTotal = 0;
        const questionCount = sheet.questions.length;

        if (questionCount === 0) {
            continue;
        }

        for (const question of sheet.questions) {
            const result = question.result;
            if (result === null) {
                continue;
            }
            const isCompleted = result.current == result.goal;
            const currentStars = result.stars + Number(isCompleted);
            const targetStars = result.stars + 1;
            progressTotal += currentStars / targetStars;
        }

        const progress = questionCount ? progressTotal / questionCount : 0;

        sheets.push({
            id: sheet.id,
            sheetName: sheet.sheetName,
            progress: progress,
        });
    }
    return sheets;
}

export default async function Tests() {
    let allSheets: { id: number; sheetName: string; progress: number }[];
    try {
        allSheets = await getSheetsByProgress();
    } catch {
        return notFound();
    }

    return (
        <div className={styles.centre}>
            <h1>Select a sheet</h1>
            <TestSheetTable sheets={allSheets}></TestSheetTable>
        </div>
    );
}

export const dynamic = "force-dynamic";
