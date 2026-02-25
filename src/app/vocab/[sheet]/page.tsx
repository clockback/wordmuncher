import { notFound } from "next/navigation";
import { Op, col } from "sequelize";

import {
    InflectionCategory,
    InflectionFeature,
    InflectionType,
    Sheet,
    TonguePair,
} from "@models";

import SheetEditor from "./components/sheet-editor/sheet-editor";
import { getSettings } from "src/db/helpers/settings";

async function getOtherSheetNames(
    sheetId: number,
    tonguePairId: number,
): Promise<string[]> {
    const sheets = await Sheet.findAll({
        where: {
            id: { [Op.not]: sheetId },
            tonguePairId,
        },
    });
    const names = [];
    for (const sheet of sheets) {
        names.push(sheet.sheetName);
    }
    return names;
}

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

    const otherSheetNames = await getOtherSheetNames(
        sheet.id,
        settings.tonguePairId,
    );

    const tonguePair = await TonguePair.findByPk(settings.tonguePairId, {
        include: [{ association: "native" }, { association: "studying" }],
    });

    const nativeTongue = {
        id: tonguePair.native.id,
        tongueName: tonguePair.native.tongueName,
        flag: tonguePair.native.flag,
        languageCode: tonguePair.native.languageCode,
    };
    const studyingTongue = {
        id: tonguePair.studying.id,
        tongueName: tonguePair.studying.tongueName,
        flag: tonguePair.studying.flag,
        languageCode: tonguePair.studying.languageCode,
    };

    return (
        <SheetEditor
            sheet={sheet.toJSON()}
            questions={questionsJson}
            inflectionTypes={inflectionTypesJSON}
            otherSheetNames={otherSheetNames}
            nativeTongue={nativeTongue}
            studyingTongue={studyingTongue}
        ></SheetEditor>
    );
}
