import { notFound } from "next/navigation";

import { Sheet } from "@models";

import SheetEditor from "./components/sheet-editor/sheet-editor";

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
    const questionsJson = [];
    for (const question of questions) {
        questionsJson.push(question.toJSON());
    }

    return (
        <SheetEditor
            sheet={sheet.toJSON()}
            questions={questionsJson}
        ></SheetEditor>
    );
}
