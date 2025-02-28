"use client";

import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { useState } from "react";

import Button from "@components/button/button";
import DefineCategory from "@components/define-category/define-category";
import EditableHeader from "@components/editable-header/editable-header";
import InflectionTemplateProposal from "@components/inflection-template-proposal/inflection-template-proposal";

import {
    CategoryInterface,
    FeatureInterface,
} from "../../../helpers/interfaces";
import { InflectionValidity } from "../../helpers/helpers";
import { AddInflectionsRequestAPI } from "../../submit/api";
import ValidityAssessment from "../validity-assessment/validity-assessment";
import styles from "./add-inflection-area.module.css";

function generateJSONRepresentation(
    inflectionName: string,
    primaryCategory: string,
    primaryFeatures: string[],
    secondaryCategory: string,
    secondaryFeatures: string[],
    numberOfCategories: number,
): AddInflectionsRequestAPI {
    const categories = [
        {
            categoryName: primaryCategory,
            features: primaryFeatures,
        },
    ];
    if (numberOfCategories === 2) {
        categories.push({
            categoryName: secondaryCategory,
            features: secondaryFeatures,
        });
    }

    return {
        inflectionName,
        categories,
    };
}

function isValid(
    proposedName: string,
    numberOfCategories: number,
    primaryCategory: string,
    secondaryCategory: string,
    primaryFeaturesLength: number,
    secondaryFeaturesLength: number,
): InflectionValidity {
    if (proposedName === "") {
        return InflectionValidity.InflectionNotNamed;
    } else if (
        primaryCategory === "" ||
        (numberOfCategories === 2 && secondaryCategory === "")
    ) {
        return InflectionValidity.CategoryNotNamed;
    } else if (
        numberOfCategories === 2 &&
        primaryCategory === secondaryCategory
    ) {
        return InflectionValidity.MatchingCategoryNames;
    } else if (
        primaryFeaturesLength === 0 ||
        (numberOfCategories === 2 && secondaryFeaturesLength === 0)
    ) {
        return InflectionValidity.MissingFeatures;
    } else {
        return InflectionValidity.Valid;
    }
}

export default function AddInflectionArea() {
    const [proposedName, setProposedName] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(true);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [numberOfCategories, setNumberOfCategories] = useState<number>(1);
    const [primaryFeatures, setPrimaryFeatures] = useState<FeatureInterface[]>(
        [],
    );
    const [secondaryFeatures, setSecondaryFeatures] = useState<
        FeatureInterface[]
    >([]);
    const [primaryCategory, setPrimaryCategory] = useState<CategoryInterface>({
        name: "",
        id: null,
    });
    const [secondaryCategory, setSecondaryCategory] =
        useState<CategoryInterface>({
            name: "",
            id: null,
        });

    const inflectionTemplateValidlyFormed = isValid(
        proposedName,
        numberOfCategories,
        primaryCategory.name,
        secondaryCategory.name,
        primaryFeatures.length,
        secondaryFeatures.length,
    );

    const onBlurHandleResponse = async (
        response: NextResponse,
        previousName: string,
    ) => {
        setIsPending(false);
        if (!response.ok) {
            console.error(
                `Failed to check for inflection with name "${previousName}".`,
            );
            return;
        }

        const responseJSON = await response.json();
        if (responseJSON.exists) {
            setProposedName(previousName);
            setIsEditing(proposedName === null);
        } else {
            setIsEditing(false);
        }
    };

    const onBlur = (inputText: string) => {
        if (inputText.length === 0 || inputText === proposedName) {
            setIsEditing(proposedName === null);
            return;
        }
        setIsPending(true);
        setProposedName(inputText);
        const url =
            "/vocab/inflections/exists?" +
            new URLSearchParams({
                "inflection-type-name": inputText,
            }).toString();
        fetch(url).then((response: NextResponse) =>
            onBlurHandleResponse(response, proposedName),
        );
    };

    const toggleNumberOfCategories = () => {
        if (numberOfCategories === 2) {
            setNumberOfCategories(1);
        } else {
            setNumberOfCategories(2);
        }
    };

    const saveInflectionHandleResponse = (response: NextResponse) => {
        if (!response.ok) {
            setIsPending(false);
            console.error("Failed to create inflection type!");
            return;
        }

        redirect("/vocab/inflections/");
    };

    const saveInflection = () => {
        setIsPending(true);

        const primaryFeatureNames = [];
        for (const primaryFeature of primaryFeatures) {
            primaryFeatureNames.push(primaryFeature.name);
        }
        const secondaryFeatureNames = [];
        if (numberOfCategories === 2) {
            for (const secondaryFeature of secondaryFeatures) {
                secondaryFeatureNames.push(secondaryFeature.name);
            }
        }

        fetch("/vocab/inflections/add/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
                generateJSONRepresentation(
                    proposedName,
                    primaryCategory.name,
                    primaryFeatureNames,
                    secondaryCategory.name,
                    secondaryFeatureNames,
                    numberOfCategories,
                ),
            ),
        }).then(saveInflectionHandleResponse);
    };

    const secondaryAddCategory =
        numberOfCategories === 2 ? (
            <DefineCategory
                isPending={isPending}
                category={secondaryCategory}
                setCategory={setSecondaryCategory}
                features={secondaryFeatures}
                setFeatures={setSecondaryFeatures}
            ></DefineCategory>
        ) : null;
    return (
        <>
            <EditableHeader
                currentProposal={proposedName}
                isEditing={isEditing}
                isPending={isPending}
                onBlur={onBlur}
                setIsEditing={setIsEditing}
                title="Inflection"
            ></EditableHeader>
            <h2>Categories</h2>
            <Button onClick={toggleNumberOfCategories}>
                {numberOfCategories === 1 ? "Add rows" : "Remove rows"}
            </Button>
            <div>
                <DefineCategory
                    isPending={isPending}
                    category={primaryCategory}
                    setCategory={setPrimaryCategory}
                    features={primaryFeatures}
                    setFeatures={setPrimaryFeatures}
                ></DefineCategory>
                {secondaryAddCategory}
            </div>
            <ValidityAssessment
                isValid={inflectionTemplateValidlyFormed}
            ></ValidityAssessment>
            <InflectionTemplateProposal
                isValid={inflectionTemplateValidlyFormed}
                proposedName={proposedName}
                numberOfCategories={numberOfCategories}
                primaryCategory={primaryCategory}
                secondaryCategory={secondaryCategory}
                primaryFeatures={primaryFeatures}
                secondaryFeatures={secondaryFeatures}
                representativeQuestion={null}
            ></InflectionTemplateProposal>
            <div className={styles.savemargin}>
                <Button
                    onClick={saveInflection}
                    disabled={
                        isPending ||
                        inflectionTemplateValidlyFormed !==
                            InflectionValidity.Valid
                    }
                >
                    Save
                </Button>
            </div>
        </>
    );
}
