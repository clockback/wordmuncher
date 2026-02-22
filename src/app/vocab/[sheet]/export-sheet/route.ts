import { NextRequest } from "next/server";

import {
    InflectionCategory,
    InflectionFeature,
    InflectionType,
    Sheet,
    Tongue,
    TonguePair,
} from "@models";

import {
    ExportInflectionAnswer,
    ExportInflectionType,
    ExportQuestion,
    ExportSheetJSON,
} from "./api";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ sheet: string }> },
) {
    const sheetId = parseInt((await params).sheet);

    const sheet = await Sheet.findByPk(sheetId);

    if (!sheet) {
        return new Response(null, { status: 404 });
    }

    const tonguePair = await TonguePair.findByPk(sheet.tonguePairId);
    const nativeTongue = await Tongue.findByPk(tonguePair.nativeTongueId);
    const studyingTongue = await Tongue.findByPk(tonguePair.studyingTongueId);

    const questions = await sheet.getQuestions();

    // Collect inflection type IDs used by questions in this sheet.
    const inflectionTypeIds = new Set<number>();
    for (const question of questions) {
        if (question.inflectionTypeId) {
            inflectionTypeIds.add(question.inflectionTypeId);
        }
    }

    // Load inflection types with their full category/feature structure.
    const inflectionTypes =
        inflectionTypeIds.size > 0
            ? await InflectionType.findAll({
                  where: { id: Array.from(inflectionTypeIds) },
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
              })
            : [];

    // Build lookup maps: inflectionTypeId → typeName, featureId → featureName.
    const inflectionTypeNameById = new Map<number, string>();
    const featureNameById = new Map<number, string>();

    for (const inflectionType of inflectionTypes) {
        inflectionTypeNameById.set(inflectionType.id, inflectionType.typeName);
        for (const category of inflectionType.categories) {
            for (const feature of category.features) {
                featureNameById.set(feature.id, feature.featureName);
            }
        }
    }

    // Build export inflection type definitions.
    const exportInflectionTypes: ExportInflectionType[] = [];
    for (const inflectionType of inflectionTypes) {
        const primaryCategory = inflectionType.categories.find(
            (c) => c.isPrimary,
        );
        const secondaryCategory = inflectionType.categories.find(
            (c) => !c.isPrimary,
        );

        const exportType: ExportInflectionType = {
            typeName: inflectionType.typeName,
            primaryCategory: {
                categoryName: primaryCategory.categoryName,
                features: primaryCategory.features
                    .sort((a, b) => a.orderInCategory - b.orderInCategory)
                    .map((f) => f.featureName),
            },
        };

        if (secondaryCategory) {
            exportType.secondaryCategory = {
                categoryName: secondaryCategory.categoryName,
                features: secondaryCategory.features
                    .sort((a, b) => a.orderInCategory - b.orderInCategory)
                    .map((f) => f.featureName),
            };
        }

        exportInflectionTypes.push(exportType);
    }

    // Build export questions.
    const exportQuestions: ExportQuestion[] = [];
    for (const question of questions) {
        if (question.inflectionTypeId) {
            // Inflection question.
            const inflectionAnswers: ExportInflectionAnswer[] = [];
            for (const answer of question.inflectionAnswers) {
                const exportAnswer: ExportInflectionAnswer = {
                    primaryFeature: featureNameById.get(
                        answer.primaryFeatureId,
                    ),
                    answerText: answer.answerText,
                };
                if (answer.secondaryFeatureId) {
                    exportAnswer.secondaryFeature = featureNameById.get(
                        answer.secondaryFeatureId,
                    );
                }
                inflectionAnswers.push(exportAnswer);
            }

            exportQuestions.push({
                questionText: question.questionText,
                inflectionType: inflectionTypeNameById.get(
                    question.inflectionTypeId,
                ),
                inflectionAnswers,
            });
        } else {
            // Simple question.
            const mainAnswer = question.answers.find((a) => a.isMainAnswer);
            const otherAnswers = question.answers
                .filter((a) => !a.isMainAnswer)
                .map((a) => a.answerText);

            exportQuestions.push({
                questionText: question.questionText,
                mainAnswer: mainAnswer.answerText,
                otherAnswers,
            });
        }
    }

    const exportData: ExportSheetJSON = {
        sheetName: sheet.sheetName,
        nativeTongue: nativeTongue.tongueName,
        studyingTongue: studyingTongue.tongueName,
        inflectionTypes: exportInflectionTypes,
        questions: exportQuestions,
    };

    const json = JSON.stringify(exportData, null, 2);
    const encoded = new TextEncoder().encode(json);

    return new Response(encoded, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
    });
}
