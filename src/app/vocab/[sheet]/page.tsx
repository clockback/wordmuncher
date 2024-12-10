import { notFound } from "next/navigation";

import Button from "@components/button/button";

import { Sheet } from "@models";

import EditSheetHeader from "./components/edit-sheet-header/edit-sheet-header";
import QuestionTable from "./components/question-table/question-table";
import styles from "./edit-sheet.module.css";

export default async function Page({
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

    const questions = await sheet.getQuestions();

    return (
        <>
            <EditSheetHeader>{sheet.sheetName}</EditSheetHeader>
            <div className={styles.allcolumns}>
                <div className={styles.lefthalf}>
                    <div className={styles.pad}>
                        <QuestionTable allQuestions={questions}></QuestionTable>
                    </div>
                </div>
                <div className={styles.righthalf}>
                    <div className={styles.pad}></div>
                </div>
            </div>
            <div className={styles.bottombuttons}>
                <div className={styles.alignbuttons}>
                    <Button>Delete</Button>
                    <Button href="/vocab">Back</Button>
                </div>
            </div>
        </>
    );
}
