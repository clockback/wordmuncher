"use client";

import InflectionTemplate from "@components/inflection-template/inflection-template";

import { InflectionType } from "@models";

import { InflectionValidity } from "../../helpers/helpers";

interface EmptyInflectionTemplateProps {
    isValid: InflectionValidity;
    proposedName: string | null;
    numberOfCategories: number;
    primaryCategory: string;
    secondaryCategory: string;
    primaryFeatures: string[];
    secondaryFeatures: string[];
}

export default function EmptyInflectionTemplate({
    isValid,
    proposedName,
    numberOfCategories,
    primaryCategory,
    secondaryCategory,
    primaryFeatures,
    secondaryFeatures,
}: EmptyInflectionTemplateProps) {
    if (isValid !== InflectionValidity.Valid) {
        return null;
    }

    const primaryFeaturesModels = [];
    for (let featureI = 0; featureI < primaryFeatures.length; featureI++) {
        const feature = primaryFeatures[featureI];
        primaryFeaturesModels.push({
            id: featureI,
            inflectionCategoryId: 1,
            featureName: feature,
            orderInCategory: featureI,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    const categories = [
        {
            id: 1,
            inflectionTypeId: 1,
            categoryName: primaryCategory,
            isPrimary: true,
            features: primaryFeaturesModels,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    if (numberOfCategories === 2) {
        const secondaryFeaturesModels = [];
        for (
            let featureI = 0;
            featureI < secondaryFeatures.length;
            featureI++
        ) {
            const feature = secondaryFeatures[featureI];
            secondaryFeaturesModels.push({
                id: featureI,
                inflectionCategoryId: 1,
                featureName: feature,
                orderInCategory: featureI,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        categories.push({
            id: 2,
            inflectionTypeId: 1,
            categoryName: secondaryCategory,
            isPrimary: true,
            features: secondaryFeaturesModels,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    const inflectionType = {
        id: 1,
        tonguePairId: 1,
        typeName: proposedName,
        createdAt: new Date(),
        updatedAt: new Date(),
        categories,
    };

    return (
        <>
            <InflectionTemplate
                inflectionType={inflectionType as InflectionType}
                representativeQuestion={null}
            ></InflectionTemplate>
        </>
    );
}
