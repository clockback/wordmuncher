import { notFound } from "next/navigation";
import { Op, col } from "sequelize";

import {
    InflectionAnswer,
    InflectionCategory,
    InflectionFeature,
    InflectionType,
    Question,
} from "@models";

import EditInflectionArea from "./components/edit-inflection-area/edit-inflection-area";

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

async function getAllOtherInflectionTypeNames(
    inflectionType: number,
): Promise<string[]> {
    const types = await InflectionType.findAll({
        where: { id: { [Op.not]: inflectionType } },
    });
    const names = [];
    for (const type of types) {
        names.push(type.typeName);
    }
    return names;
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

    const otherInflectionNames = await getAllOtherInflectionTypeNames(
        loadParams["inflection-type"],
    );
    const representativeQuestion = await getMostRepresentativeQuestion(
        loadParams["inflection-type"],
    );

    return (
        <EditInflectionArea
            inflectionType={inflectionType.toJSON()}
            otherInflectionNames={otherInflectionNames}
            representativeQuestion={
                representativeQuestion === null
                    ? null
                    : representativeQuestion.toJSON()
            }
        ></EditInflectionArea>
    );
}
