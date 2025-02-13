"use client";

import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { useState } from "react";

import Button from "@components/button/button";
import EditableHeader from "@components/editable-header/editable-header";

import { InflectionValidity } from "../../helpers/helpers";
import AddCategory from "../add-category/add-category";
import EmptyInflectionTemplate from "../empty-inflection-template/empty-inflection-template";
import ValidityAssessment from "../validity-assessment/validity-assessment";
import styles from "./add-inflection-area.module.css";

interface InflectionTypeExistsContent {
    exists: boolean;
}

function generateJSONRepresentation(
    inflectionName: string,
    primaryCategory: string,
    primaryFeatures: string[],
    secondaryCategory: string,
    secondaryFeatures: string[],
    numberOfCategories: number,
): string {
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

    return JSON.stringify({
        inflectionName,
        categories,
    });
}

function isValid(
    proposedName: string,
    numberOfCategories: number,
    primaryCategory: string,
    secondaryCategory: string,
    primaryFeatures: string[],
    secondaryFeatures: string[],
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
        primaryFeatures.length === 0 ||
        (numberOfCategories === 2 && secondaryFeatures.length === 0)
    ) {
        return InflectionValidity.MissingFeatures;
    } else {
        return InflectionValidity.Valid;
    }
}

export default function AddInflectionArea() {
    const [proposedName, setProposedName] = useState(null);
    const [isEditing, setIsEditing] = useState(true);
    const [isPending, setIsPending] = useState(false);
    const [numberOfCategories, setNumberOfCategories] = useState(1);
    const [primaryFeatures, setPrimaryFeatures] = useState([]);
    const [secondaryFeatures, setSecondaryFeatures] = useState([]);
    const [primaryCategory, setPrimaryCategory] = useState("");
    const [secondaryCategory, setSecondaryCategory] = useState("");

    const inflectionTemplateValidlyFormed = isValid(
        proposedName,
        numberOfCategories,
        primaryCategory,
        secondaryCategory,
        primaryFeatures,
        secondaryFeatures,
    );

    const onBlurHandleResponse = (
        response: NextResponse,
        previousName: string,
    ) => {
        response.json().then((contents: InflectionTypeExistsContent) => {
            setIsPending(false);
            if (contents.exists) {
                setProposedName(previousName);
                setIsEditing(proposedName === null);
            } else {
                setIsEditing(false);
            }
        });
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
        setIsPending(false);
        if (response.status !== 204) {
            console.error("Failed to rename inflection type!");
            return;
        }

        redirect("/vocab/inflections/");
    };

    const saveInflection = () => {
        setIsPending(true);
        fetch("/vocab/inflections/add/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: generateJSONRepresentation(
                proposedName,
                primaryCategory,
                primaryFeatures,
                secondaryCategory,
                secondaryFeatures,
                numberOfCategories,
            ),
        }).then(saveInflectionHandleResponse);
    };

    const secondaryAddCategory =
        numberOfCategories === 2 ? (
            <AddCategory
                isPending={isPending}
                categoryName={secondaryCategory}
                setCategoryName={setSecondaryCategory}
                features={secondaryFeatures}
                setFeatures={setSecondaryFeatures}
            ></AddCategory>
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
                <AddCategory
                    isPending={isPending}
                    categoryName={primaryCategory}
                    setCategoryName={setPrimaryCategory}
                    features={primaryFeatures}
                    setFeatures={setPrimaryFeatures}
                ></AddCategory>
                {secondaryAddCategory}
            </div>
            <ValidityAssessment
                isValid={inflectionTemplateValidlyFormed}
            ></ValidityAssessment>
            <EmptyInflectionTemplate
                isValid={inflectionTemplateValidlyFormed}
                proposedName={proposedName}
                numberOfCategories={numberOfCategories}
                primaryCategory={primaryCategory}
                secondaryCategory={secondaryCategory}
                primaryFeatures={primaryFeatures}
                secondaryFeatures={secondaryFeatures}
            ></EmptyInflectionTemplate>
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
