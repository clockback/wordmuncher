import { notFound } from "next/navigation";
import { col } from "sequelize";

import Button from "@components/button/button";

import {
    InflectionAnswer,
    InflectionCategory,
    InflectionFeature,
    InflectionType,
    Question,
} from "@models";

import InflectionTemplate from "./components/inflection-template/inflection-template";
import styles from "./inflection-type.module.css";

async function getInflectionType(
    inflectionType: number,
): Promise<InflectionType | null> {
    return await InflectionType.findByPk(inflectionType, {
        include: {
            model: InflectionCategory,
            as: "categories",
            include: [
                {
                    model: InflectionFeature,
                    as: "features",
                    order: col("orderInCategory"),
                },
            ],
        },
    });
}

function getNumberOfAnsweredFeaturesInQuestion(question: Question): number {
    const features = new Set<number>();
    for (const answer of question.inflectionAnswers) {
        features.add(answer.primaryFeatureId);
        features.add(answer.secondaryFeatureId);
    }
    return features.size;
}

async function getMostRepresentativeQuestion(
    inflectionType: number,
): Promise<Question | null> {
    const questions = await Question.findAll({
        where: { inflectionTypeId: inflectionType },
        include: {
            model: InflectionAnswer,
            as: "inflectionAnswers",
            required: true,
        },
    });

    let mostRepresentative = null;
    let mostRepresentativeNumberOfAnsweredFeatures = 0;
    for (const question of questions) {
        const numberOfAnsweredFeatures =
            getNumberOfAnsweredFeaturesInQuestion(question);

        if (
            numberOfAnsweredFeatures >
            mostRepresentativeNumberOfAnsweredFeatures
        ) {
            mostRepresentative = question;
            mostRepresentativeNumberOfAnsweredFeatures =
                numberOfAnsweredFeatures;
        }
    }

    return mostRepresentative;
}

export default async function ModifyInflectionType({
    params,
}: {
    params: Promise<{ "inflection-type": number }>;
}) {
    const loadParams = await params;
    if (loadParams === undefined) {
        return notFound();
    }

    const inflectionType = await getInflectionType(
        loadParams["inflection-type"],
    );
    if (inflectionType === null) {
        return notFound();
    }

    const representativeQuestion = await getMostRepresentativeQuestion(
        loadParams["inflection-type"],
    );

    return (
        <>
            <div className={styles.leftmargin}>
                <h1>{inflectionType.typeName}</h1>
            </div>
            <div style={{ textAlign: "center" }}>
                <InflectionTemplate
                    inflectionType={inflectionType}
                    representativeQuestion={representativeQuestion}
                ></InflectionTemplate>
                <div className={styles.buttonmargin}>
                    <Button href="/vocab/inflections">Back</Button>
                </div>
            </div>
        </>
    );
}
