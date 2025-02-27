import { notFound } from "next/navigation";

import { Sheet } from "@models";

import TestArea from "./components/test-area/test-area";
import { getNumberOfStars, getQuestion } from "./server-helpers";
import styles from "./test-page.module.css";

export default async function TestSheet({
    params,
    searchParams,
}: {
    params: Promise<{ sheet: number; testLength: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const loadParams = await params;
    if (loadParams === undefined) {
        return notFound();
    }

    const noQuestionsString = (await searchParams).questions;
    let numberOfQuestions: number | null;
    if (noQuestionsString === "all") {
        numberOfQuestions = null;
    } else if (typeof noQuestionsString !== "string") {
        return notFound();
    } else {
        numberOfQuestions = parseInt(noQuestionsString);
        if (Number.isNaN(numberOfQuestions)) {
            return notFound();
        } else if (numberOfQuestions < 1) {
            return notFound();
        }
    }

    const sheet = await Sheet.findByPk(loadParams.sheet);
    if (sheet === null) {
        return notFound();
    }

    const question = await getQuestion(sheet, []);
    const startingNumberOfStars = await getNumberOfStars(sheet);

    return (
        <>
            <h1 className={styles.sheetname}>{sheet.sheetName}</h1>
            <TestArea
                initialQuestion={question.toJSON()}
                sheet={sheet.toJSON()}
                numberOfQuestions={numberOfQuestions}
                startingNumberOfStars={startingNumberOfStars}
            ></TestArea>
        </>
    );
}
