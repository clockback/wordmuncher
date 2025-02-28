import { NextRequest, NextResponse } from "next/server";

import { InflectionCategory, InflectionFeature, InflectionType } from "@models";

import { AddInflectionsRequestAPI } from "./api";
import { getSettings } from "src/db/helpers/settings";
import sequelize from "src/db/models/db-connection";

export async function POST(request: NextRequest) {
    const requestJSON: AddInflectionsRequestAPI = await request.json();
    const { inflectionName, categories } = requestJSON;

    const tonguePairId = (await getSettings()).tonguePairId;

    try {
        await sequelize.transaction(async (t) => {
            const inflectionType = await InflectionType.create(
                { tonguePairId, typeName: inflectionName },
                { transaction: t },
            );

            let isPrimary = true;
            for (const category of categories) {
                const categoryModel = await InflectionCategory.create(
                    {
                        inflectionTypeId: inflectionType.id,
                        categoryName: category.categoryName,
                        isPrimary,
                    },
                    { transaction: t },
                );
                isPrimary = false;

                for (
                    let featureI = 0;
                    featureI < category.features.length;
                    featureI++
                ) {
                    const feature = category.features[featureI];
                    await InflectionFeature.create(
                        {
                            inflectionCategoryId: categoryModel.id,
                            orderInCategory: featureI + 1,
                            featureName: feature,
                        },
                        { transaction: t },
                    );
                }
            }
        });
    } catch (error) {
        console.log(`error: ${error}`);
        return NextResponse.json({}, { status: 409 });
    }

    return new Response(null, { status: 204 });
}
