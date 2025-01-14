import { notFound } from "next/navigation";

import { Sheet } from "@models";

import TestArea from "./components/test-area/test-area";
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
            <TestArea
                initialQuestion={question.toJSON()}
                sheet={sheet.toJSON()}
            ></TestArea>
        </>
    );
}
