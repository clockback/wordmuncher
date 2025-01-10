import { notFound } from "next/navigation";

import { Sheet } from "@models";

import TestQuestion from "./components/test-question/test-question";
import { getQuestion } from "./helpers";
import styles from "./test-page.module.css";

export default async function TestSheet({
    params,
}: {
    params: Promise<{ sheet: number }>;
}) {
    const loadParams = await params;
    if (loadParams === undefined) {
        return notFound();
    }

    const sheet = await Sheet.findByPk(loadParams.sheet);
    if (sheet === null) {
        return notFound();
    }

    const question = await getQuestion(sheet, []);

    return (
        <>
            <h1 className={styles.sheetname}>{sheet.sheetName}</h1>
            <div className={styles.centre}>
                <div className={styles.verticalcentre}>
                    <TestQuestion
                        sheet={sheet.toJSON()}
                        initialQuestion={question.toJSON()}
                    ></TestQuestion>
                </div>
            </div>
        </>
    );
}
