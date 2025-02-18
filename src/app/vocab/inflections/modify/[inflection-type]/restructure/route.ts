import { NextRequest, NextResponse } from "next/server";
import { Op, literal } from "sequelize";

import { InflectionCategory, InflectionFeature } from "@models";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ "inflection-type": string }> },
) {
    const inflectionTypeId = parseInt((await params)["inflection-type"]);
    const requestJSON = await request.json();
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
        await InflectionCategory.update(
            { categoryName: primaryCategoryName },
            { where: { id: primaryCategoryId, inflectionTypeId } },
        );
        await InflectionCategory.update(
            { categoryName: secondaryCategoryName },
            { where: { id: secondaryCategoryId, inflectionTypeId } },
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
                    { where: { id, inflectionCategoryId: primaryCategoryId } },
                );
            } else {
                await InflectionFeature.create({
                    inflectionCategoryId: primaryCategoryId,
                    featureName: name,
                    orderInCategory: -(primaryFeatureIndex + 1),
                });
            }
        }

        await InflectionFeature.update(
            { orderInCategory: literal("orderInCategory * -1") },
            { where: { inflectionCategoryId: primaryCategoryId } },
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
                    },
                );
            } else {
                await InflectionFeature.create({
                    inflectionCategoryId: secondaryCategoryId,
                    featureName: name,
                    orderInCategory: -(secondaryFeatureIndex + 1),
                });
            }
        }

        await InflectionFeature.update(
            { orderInCategory: literal("orderInCategory * -1") },
            { where: { inflectionCategoryId: secondaryCategoryId } },
        );
    } catch (error) {
        console.log(`error: ${error}`);
        return NextResponse.json({}, { status: 409 });
    }

    return new Response(null, { status: 204 });
}
