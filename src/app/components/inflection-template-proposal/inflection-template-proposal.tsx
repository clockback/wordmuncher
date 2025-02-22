"use client";

import { JSX } from "react";

import InflectionTemplate from "@components/inflection-template/inflection-template";

import { InflectionType, Question } from "@models";

import { InflectionValidity } from "../../vocab/inflections/add/helpers/helpers";
import {
    CategoryInterface,
    FeatureInterface,
} from "src/app/vocab/inflections/helpers/interfaces";

interface InflectionTemplateProposalProps {
    isValid: InflectionValidity;
    proposedName: string | null;
    numberOfCategories: number;
    primaryCategory: CategoryInterface;
    secondaryCategory: CategoryInterface;
    primaryFeatures: FeatureInterface[];
    secondaryFeatures: FeatureInterface[];
    representativeQuestion: Question | null;
}

export default function InflectionTemplateProposal({
    isValid,
    proposedName,
    numberOfCategories,
    primaryCategory,
    secondaryCategory,
    primaryFeatures,
    secondaryFeatures,
    representativeQuestion = null,
}: InflectionTemplateProposalProps) {
    if (isValid !== InflectionValidity.Valid) {
        return null;
    }

    const primaryFeaturesModels = [];
    for (let featureI = 0; featureI < primaryFeatures.length; featureI++) {
        const feature = primaryFeatures[featureI];
        primaryFeaturesModels.push({
            id: feature.id ?? -featureI,
            inflectionCategoryId: primaryCategory.id ?? -1,
            featureName: feature.name,
            orderInCategory: featureI,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    const categories = [
        {
            id: primaryCategory.id ?? -1,
            inflectionTypeId: 1,
            categoryName: primaryCategory.name,
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
                id: feature.id ?? -featureI,
                inflectionCategoryId: secondaryCategory.id ?? -2,
                featureName: feature.name,
                orderInCategory: featureI,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        categories.push({
            id: secondaryCategory.id ?? -2,
            inflectionTypeId: 1,
            categoryName: secondaryCategory.name,
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

    const cellContents = new Map<string, () => JSX.Element>();
    for (const answer of representativeQuestion.inflectionAnswers) {
        const answerCellGenerator = () => <>{answer.answerText}</>;
        let keyForAnswerCell: string;
        if (answer.secondaryFeatureId === null) {
            keyForAnswerCell = answer.primaryFeatureId.toString();
        } else {
            keyForAnswerCell = `${answer.primaryFeatureId},${answer.secondaryFeatureId}`;
        }
        cellContents.set(keyForAnswerCell, answerCellGenerator);
    }

    return (
        <>
            <InflectionTemplate
                inflectionType={inflectionType as InflectionType}
                cellContents={cellContents}
            ></InflectionTemplate>
        </>
    );
}
