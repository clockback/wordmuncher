import { NextRequest, NextResponse } from "next/server";
import { UniqueConstraintError } from "sequelize";

import {
    Answer,
    InflectionAnswer,
    InflectionCategory,
    InflectionFeature,
    InflectionType,
    Question,
    Result,
    Sheet,
    SheetQuestion,
    Tongue,
    TonguePair,
} from "@models";

import {
    ExportInflectionType,
    ExportQuestion,
    ExportSheetJSON,
} from "../[sheet]/export-sheet/api";
import { ImportSheetResponseAPI } from "./api";
import { getSettings } from "src/db/helpers/settings";
import sequelize from "src/db/models/db-connection";

function isExportSheetJSON(data: unknown): data is ExportSheetJSON {
    if (typeof data !== "object" || data === null) return false;
    const obj = data as Record<string, unknown>;
    if (typeof obj.sheetName !== "string") return false;
    if (typeof obj.nativeTongue !== "string") return false;
    if (typeof obj.studyingTongue !== "string") return false;
    if (!Array.isArray(obj.inflectionTypes)) return false;
    if (!Array.isArray(obj.questions)) return false;

    for (const it of obj.inflectionTypes) {
        if (typeof it !== "object" || it === null) return false;
        if (typeof it.typeName !== "string") return false;
        if (
            typeof it.primaryCategory !== "object" ||
            it.primaryCategory === null
        )
            return false;
        if (typeof it.primaryCategory.categoryName !== "string") return false;
        if (!Array.isArray(it.primaryCategory.features)) return false;
        if (it.secondaryCategory !== undefined) {
            if (
                typeof it.secondaryCategory !== "object" ||
                it.secondaryCategory === null
            )
                return false;
            if (typeof it.secondaryCategory.categoryName !== "string")
                return false;
            if (!Array.isArray(it.secondaryCategory.features)) return false;
        }
    }

    for (const q of obj.questions) {
        if (typeof q !== "object" || q === null) return false;
        if (typeof q.questionText !== "string") return false;
        if ("inflectionType" in q) {
            if (typeof q.inflectionType !== "string") return false;
            if (!Array.isArray(q.inflectionAnswers)) return false;
            for (const ia of q.inflectionAnswers) {
                if (typeof ia !== "object" || ia === null) return false;
                if (typeof ia.primaryFeature !== "string") return false;
                if (typeof ia.answerText !== "string") return false;
            }
        } else {
            if (typeof q.mainAnswer !== "string") return false;
            if (!Array.isArray(q.otherAnswers)) return false;
        }
    }

    return true;
}

interface ResolvedInflectionType {
    inflectionTypeId: number;
    featureNameToId: Map<string, number>;
}

async function resolveInflectionType(
    exportType: ExportInflectionType,
    tonguePairId: number,
    transaction: import("sequelize").Transaction,
): Promise<ResolvedInflectionType> {
    const featureNameToId = new Map<string, number>();

    const existing = await InflectionType.findOne({
        where: { tonguePairId, typeName: exportType.typeName },
        include: [
            {
                model: InflectionCategory,
                as: "categories",
                include: [
                    {
                        model: InflectionFeature,
                        as: "features",
                    },
                ],
            },
        ],
        transaction,
    });

    if (existing) {
        for (const category of existing.categories) {
            for (const feature of category.features) {
                featureNameToId.set(feature.featureName, feature.id);
            }
        }
        return { inflectionTypeId: existing.id, featureNameToId };
    }

    const inflectionType = await InflectionType.create(
        { tonguePairId, typeName: exportType.typeName },
        { transaction },
    );

    const categories = [exportType.primaryCategory];
    if (exportType.secondaryCategory) {
        categories.push(exportType.secondaryCategory);
    }

    let isPrimary = true;
    for (const category of categories) {
        const categoryModel = await InflectionCategory.create(
            {
                inflectionTypeId: inflectionType.id,
                categoryName: category.categoryName,
                isPrimary,
            },
            { transaction },
        );
        isPrimary = false;

        for (let i = 0; i < category.features.length; i++) {
            const feature = await InflectionFeature.create(
                {
                    inflectionCategoryId: categoryModel.id,
                    orderInCategory: i + 1,
                    featureName: category.features[i],
                },
                { transaction },
            );
            featureNameToId.set(feature.featureName, feature.id);
        }
    }

    return { inflectionTypeId: inflectionType.id, featureNameToId };
}

async function createQuestion(
    question: ExportQuestion,
    tonguePairId: number,
    sheetId: number,
    inflectionTypeMap: Map<string, ResolvedInflectionType>,
    transaction: import("sequelize").Transaction,
) {
    if ("inflectionType" in question) {
        const resolved = inflectionTypeMap.get(question.inflectionType);
        if (!resolved) {
            throw new Error(
                `Inflection type "${question.inflectionType}" not found.`,
            );
        }

        const newQuestion = await Question.create(
            {
                tonguePairId,
                questionText: question.questionText,
                inflectionTypeId: resolved.inflectionTypeId,
            },
            { transaction },
        );

        await Result.create(
            { questionId: newQuestion.id, stars: 0, current: 0, goal: 2 },
            { transaction },
        );

        await SheetQuestion.create(
            { sheetId, questionId: newQuestion.id },
            { transaction },
        );

        const answers = [];
        for (const ia of question.inflectionAnswers) {
            const primaryFeatureId = resolved.featureNameToId.get(
                ia.primaryFeature,
            );
            if (primaryFeatureId === undefined) {
                throw new Error(
                    `Feature "${ia.primaryFeature}" not found in inflection type "${question.inflectionType}".`,
                );
            }

            let secondaryFeatureId: number | undefined;
            if (ia.secondaryFeature) {
                secondaryFeatureId = resolved.featureNameToId.get(
                    ia.secondaryFeature,
                );
                if (secondaryFeatureId === undefined) {
                    throw new Error(
                        `Feature "${ia.secondaryFeature}" not found in inflection type "${question.inflectionType}".`,
                    );
                }
            }

            answers.push({
                questionId: newQuestion.id,
                primaryFeatureId,
                secondaryFeatureId,
                answerText: ia.answerText,
            });
        }

        await InflectionAnswer.bulkCreate(answers, { transaction });
    } else {
        const newQuestion = await Question.create(
            {
                tonguePairId,
                questionText: question.questionText,
                inflectionTypeId: null,
            },
            { transaction },
        );

        await Result.create(
            { questionId: newQuestion.id, stars: 0, current: 0, goal: 2 },
            { transaction },
        );

        await SheetQuestion.create(
            { sheetId, questionId: newQuestion.id },
            { transaction },
        );

        const answers = [
            {
                questionId: newQuestion.id,
                isMainAnswer: true,
                answerText: question.mainAnswer,
            },
            ...question.otherAnswers.map((a) => ({
                questionId: newQuestion.id,
                isMainAnswer: false,
                answerText: a,
            })),
        ];

        await Answer.bulkCreate(answers, { transaction });
    }
}

export async function POST(request: NextRequest) {
    let data: unknown;
    try {
        data = await request.json();
    } catch {
        return NextResponse.json(
            { success: false, sheetId: -1, error: "Invalid JSON." },
            { status: 400 },
        );
    }

    if (!isExportSheetJSON(data)) {
        return NextResponse.json(
            { success: false, sheetId: -1, error: "Invalid file structure." },
            { status: 422 },
        );
    }

    const json = data;

    const settings = await getSettings();
    const tonguePairId = settings.tonguePairId;
    const tonguePair = await TonguePair.findByPk(tonguePairId);
    const nativeTongue = await Tongue.findByPk(tonguePair.nativeTongueId);
    const studyingTongue = await Tongue.findByPk(tonguePair.studyingTongueId);

    if (
        nativeTongue.tongueName !== json.nativeTongue ||
        studyingTongue.tongueName !== json.studyingTongue
    ) {
        const body: ImportSheetResponseAPI = {
            success: false,
            sheetId: -1,
            error: `Language mismatch. Expected ${nativeTongue.tongueName}/${studyingTongue.tongueName}, got ${json.nativeTongue}/${json.studyingTongue}.`,
        };
        return NextResponse.json(body, { status: 422 });
    }

    let sheetId: number;

    try {
        await sequelize.transaction(async (t) => {
            const inflectionTypeMap = new Map<string, ResolvedInflectionType>();

            for (const exportType of json.inflectionTypes) {
                const resolved = await resolveInflectionType(
                    exportType,
                    tonguePairId,
                    t,
                );
                inflectionTypeMap.set(exportType.typeName, resolved);
            }

            const sheet = await Sheet.create(
                { sheetName: json.sheetName, tonguePairId },
                { transaction: t },
            );
            sheetId = sheet.id;

            for (const question of json.questions) {
                await createQuestion(
                    question,
                    tonguePairId,
                    sheet.id,
                    inflectionTypeMap,
                    t,
                );
            }
        });
    } catch (err: unknown) {
        if (err instanceof UniqueConstraintError) {
            const body: ImportSheetResponseAPI = {
                success: false,
                sheetId: -1,
                error: `A sheet named "${json.sheetName}" already exists.`,
            };
            return NextResponse.json(body, { status: 409 });
        }
        if (err instanceof Error) {
            const body: ImportSheetResponseAPI = {
                success: false,
                sheetId: -1,
                error: err.message,
            };
            return NextResponse.json(body, { status: 422 });
        }
        throw err;
    }

    const body: ImportSheetResponseAPI = { success: true, sheetId };
    return NextResponse.json(body, { status: 200 });
}
