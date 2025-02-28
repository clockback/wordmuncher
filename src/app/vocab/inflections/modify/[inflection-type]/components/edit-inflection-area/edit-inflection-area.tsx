"use client";

import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { useState } from "react";

import Button from "@components/button/button";
import DefineCategory from "@components/define-category/define-category";
import InflectionTemplateProposal from "@components/inflection-template-proposal/inflection-template-proposal";

import { InflectionType, Question } from "@models";

import editInflectionContext from "../../context";
import { RestructureInflectionsRequestAPI } from "../../restructure/api";
import InflectionHeader from "../inflection-header/inflection-header";
import styles from "./edit-inflection-area.module.css";
import { InflectionValidity } from "src/app/vocab/inflections/add/helpers/helpers";
import {
    CategoryInterface,
    FeatureInterface,
} from "src/app/vocab/inflections/helpers/interfaces";

interface EditInflectionAreaProps {
    inflectionType: InflectionType;
    otherInflectionNames: string[];
    representativeQuestion: Question | null;
}

export default function EditInflectionArea({
    inflectionType,
    otherInflectionNames,
    representativeQuestion,
}: EditInflectionAreaProps) {
    const [isPending, setIsPending] = useState<boolean>(false);
    const [inflectionName, setInflectionName] = useState<string>(
        inflectionType.typeName,
    );

    const [primaryCategory, setPrimaryCategory] = useState<CategoryInterface>({
        name: inflectionType.categories[0].categoryName,
        id: inflectionType.categories[0].id,
    });

    const defaultPrimaryFeatures = [];
    for (const primaryFeature of inflectionType.categories[0].features) {
        defaultPrimaryFeatures.push({
            name: primaryFeature.featureName,
            id: primaryFeature.id,
        });
    }
    const [primaryFeatures, setPrimaryFeatures] = useState<FeatureInterface[]>(
        defaultPrimaryFeatures,
    );

    const numberOfCategories = inflectionType.categories.length;

    const defaultSecondaryCategory = { name: "", id: null };
    const defaultSecondaryFeatures = [];
    if (numberOfCategories === 2) {
        defaultSecondaryCategory.name =
            inflectionType.categories[1].categoryName;
        defaultSecondaryCategory.id = inflectionType.categories[1].id;
        for (const secondaryFeature of inflectionType.categories[1].features) {
            defaultSecondaryFeatures.push({
                name: secondaryFeature.featureName,
                id: secondaryFeature.id,
            });
        }
    }
    const [secondaryCategory, setSecondaryCategory] =
        useState<CategoryInterface>(defaultSecondaryCategory);
    const [secondaryFeatures, setSecondaryFeatures] = useState<
        FeatureInterface[]
    >(defaultSecondaryFeatures);

    const context = {
        inflectionName,
        isPending,
        setInflectionName,
        setIsPending,
    };

    const saveInflectionHandleResponse = (response: NextResponse) => {
        if (!response.ok) {
            console.error("Failed to save inflection type.");
            setIsPending(false);
            return;
        }
        redirect("/vocab/inflections");
    };

    const saveInflection = () => {
        setIsPending(true);
        const body: RestructureInflectionsRequestAPI = {
            primaryCategory,
            secondaryCategory,
            primaryFeatures,
            secondaryFeatures,
        };
        fetch(`/vocab/inflections/modify/${inflectionType.id}/restructure`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).then(saveInflectionHandleResponse);
    };

    const deleteInflectionHandleResponse = (response: NextResponse) => {
        if (!response.ok) {
            console.error("Failed to delete inflection type.");
            setIsPending(false);
            return;
        }
        redirect("/vocab/inflections");
    };

    const deleteInflection = () => {
        setIsPending(true);
        fetch(`/vocab/inflections/delete/${inflectionType.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        }).then(deleteInflectionHandleResponse);
    };

    const secondDefineCategory =
        numberOfCategories === 1 ? null : (
            <DefineCategory
                isPending={isPending}
                category={secondaryCategory}
                setCategory={setSecondaryCategory}
                features={secondaryFeatures}
                setFeatures={setSecondaryFeatures}
            ></DefineCategory>
        );

    return (
        <editInflectionContext.Provider value={context}>
            <InflectionHeader
                inflectionType={inflectionType}
                inflectionTypeNames={otherInflectionNames}
            ></InflectionHeader>
            <div style={{ textAlign: "center" }}>
                <h2>Categories</h2>
                <div>
                    <DefineCategory
                        isPending={isPending}
                        category={primaryCategory}
                        setCategory={setPrimaryCategory}
                        features={primaryFeatures}
                        setFeatures={setPrimaryFeatures}
                    ></DefineCategory>
                    {secondDefineCategory}
                </div>
                <InflectionTemplateProposal
                    isValid={InflectionValidity.Valid}
                    proposedName={inflectionName}
                    numberOfCategories={numberOfCategories}
                    primaryCategory={primaryCategory}
                    secondaryCategory={secondaryCategory}
                    primaryFeatures={primaryFeatures}
                    secondaryFeatures={secondaryFeatures}
                    representativeQuestion={representativeQuestion}
                ></InflectionTemplateProposal>
                <div className={styles.buttonmargin}>
                    <Button onClick={saveInflection} disabled={isPending}>
                        Save
                    </Button>
                </div>
                <div className={styles.buttonmargin}>
                    <Button onClick={deleteInflection} disabled={isPending}>
                        Delete
                    </Button>
                </div>
                <div className={styles.buttonmargin}>
                    <Button href="/vocab/inflections">Back</Button>
                </div>
            </div>
        </editInflectionContext.Provider>
    );
}
