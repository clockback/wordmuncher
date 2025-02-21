import { notFound } from "next/navigation";
import { col } from "sequelize";

import {
    InflectionCategory,
    InflectionFeature,
    InflectionType,
    Sheet,
} from "@models";

import SheetEditor from "./components/sheet-editor/sheet-editor";
import { getSettings } from "src/db/helpers/settings";

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

    const settings = await getSettings();
    const tonguePairId = settings.tonguePairId;
    const inflectionTypes = await InflectionType.findAll({
        where: { tonguePairId },
        include: [
            {
                model: InflectionCategory,
                as: "categories",
                include: [
                    {
                        model: InflectionFeature,
                        as: "features",
                        order: col("orderInCategory"),
                    },
                ],
            },
        ],
    });
    const inflectionTypesJSON = [];
    for (const inflectionType of inflectionTypes) {
        inflectionTypesJSON.push(inflectionType.toJSON());
    }

    return (
        <SheetEditor
            sheet={sheet.toJSON()}
            questions={questionsJson}
            inflectionTypes={inflectionTypesJSON}
        ></SheetEditor>
    );
}
