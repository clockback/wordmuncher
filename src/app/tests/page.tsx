import { Question, Result, Sheet } from "@models";

import TestSheetRow from "./components/test-sheet-row/test-sheet-row";
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
        console.log(questionCount);
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
    const allSheets = await getSheetsByProgress();

    const tableRows = [];

    for (const sheet of allSheets) {
        tableRows.push(
            <TestSheetRow key={sheet.id} sheet={sheet}></TestSheetRow>,
        );
    }

    return (
        <div className={styles.centre}>
            <h1>Select a sheet</h1>
            <table className={styles.allsheets}>
                <thead>
                    <tr>
                        <th>Sheet name</th>
                        <th>Progress</th>
                    </tr>
                </thead>
                <tbody>{tableRows}</tbody>
            </table>
        </div>
    );
}
