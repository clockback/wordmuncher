import { NextRequest, NextResponse } from "next/server";
import { Op, literal } from "sequelize";

import { InflectionCategory, InflectionFeature } from "@models";

import {
    RestructureInflectionsRequestAPI,
    RestructureInflectionsResponseAPI,
} from "./api";
import sequelize from "src/db/models/db-connection";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ "inflection-type": string }> },
) {
    const inflectionTypeId = parseInt((await params)["inflection-type"]);
    const requestJSON: RestructureInflectionsRequestAPI = await request.json();
    const {
        primaryCategory,
        secondaryCategory,
        primaryFeatures,
        secondaryFeatures,
    } = requestJSON;

    const { name: primaryCategoryName, id: primaryCategoryId } =
        primaryCategory;
    const { name: secondaryCategoryName, id: secondaryCategoryId } =
        secondaryCategory;

    try {
        await sequelize.transaction(async (t) => {
            await InflectionCategory.update(
                { categoryName: primaryCategoryName },
                {
                    where: { id: primaryCategoryId, inflectionTypeId },
                    transaction: t,
                },
            );
            await InflectionCategory.update(
                { categoryName: secondaryCategoryName },
                {
                    where: { id: secondaryCategoryId, inflectionTypeId },
                    transaction: t,
                },
            );

            const persistPrimaryIds = [];
            for (const { id } of primaryFeatures) {
                if (id > 0) {
                    persistPrimaryIds.push(id);
                }
            }

            await InflectionFeature.destroy({
                where: {
                    inflectionCategoryId: primaryCategoryId,
                    id: { [Op.notIn]: persistPrimaryIds },
                },
                transaction: t,
            });

            for (const [
                primaryFeatureIndex,
                { name, id },
            ] of primaryFeatures.entries()) {
                if (id > 0) {
                    await InflectionFeature.update(
                        {
                            featureName: name,
                            orderInCategory: -(primaryFeatureIndex + 1),
                        },
                        {
                            where: {
                                id,
                                inflectionCategoryId: primaryCategoryId,
                            },
                            transaction: t,
                        },
                    );
                } else {
                    await InflectionFeature.create(
                        {
                            inflectionCategoryId: primaryCategoryId,
                            featureName: name,
                            orderInCategory: -(primaryFeatureIndex + 1),
                        },
                        { transaction: t },
                    );
                }
            }

            await InflectionFeature.update(
                { orderInCategory: literal("orderInCategory * -1") },
                {
                    where: { inflectionCategoryId: primaryCategoryId },
                    transaction: t,
                },
            );

            const persistSecondaryIds = [];
            for (const { id } of secondaryFeatures) {
                if (id > 0) {
                    persistSecondaryIds.push(id);
                }
            }

            await InflectionFeature.destroy({
                where: {
                    inflectionCategoryId: secondaryCategoryId,
                    id: { [Op.notIn]: persistSecondaryIds },
                },
                transaction: t,
            });

            for (const [
                secondaryFeatureIndex,
                { name, id },
            ] of secondaryFeatures.entries()) {
                if (id > 0) {
                    await InflectionFeature.update(
                        {
                            featureName: name,
                            orderInCategory: -(secondaryFeatureIndex + 1),
                        },
                        {
                            where: {
                                id,
                                inflectionCategoryId: secondaryCategoryId,
                            },
                            transaction: t,
                        },
                    );
                } else {
                    await InflectionFeature.create(
                        {
                            inflectionCategoryId: secondaryCategoryId,
                            featureName: name,
                            orderInCategory: -(secondaryFeatureIndex + 1),
                        },
                        { transaction: t },
                    );
                }
            }

            await InflectionFeature.update(
                { orderInCategory: literal("orderInCategory * -1") },
                {
                    where: { inflectionCategoryId: secondaryCategoryId },
                    transaction: t,
                },
            );
        });
    } catch (error) {
        console.log(`error: ${error}`);
        const body: RestructureInflectionsResponseAPI = {};
        return NextResponse.json(body, { status: 409 });
    }

    return new Response(null, { status: 204 });
}
