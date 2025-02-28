import { NextRequest, NextResponse } from "next/server";
import { Transaction } from "sequelize";

import { Answer, InflectionAnswer, Question } from "@models";

import {
    UpdateQuestionRequestAPI,
    UpdateQuestionRequestAPIWithAnswers,
    UpdateQuestionRequestAPIWithInflectionAnswers,
    UpdateQuestionResponseAPI,
} from "./api";
import sequelize from "src/db/models/db-connection";

async function processPlainAnswers(
    questionId: number,
    mainAnswer: string,
    otherAnswers: string[],
    createdAnswers: Answer[],
    transaction: Transaction,
) {
    const answers = [];

    for (const proposedOtherAnswer of otherAnswers) {
        answers.push({
            questionId: questionId,
            isMainAnswer: false,
            answerText: proposedOtherAnswer,
        });
    }

    await Answer.destroy({
        where: { isMainAnswer: false, questionId },
        transaction,
    });
    await Answer.update(
        { answerText: mainAnswer },
        { where: { questionId }, transaction },
    );
    await Answer.bulkCreate(answers, { transaction });

    for (const createdAnswer of await Answer.findAll({
        where: { questionId: questionId },
        transaction,
    })) {
        createdAnswers.push(createdAnswer.toJSON());
    }

    return createdAnswers;
}

async function processInflectionAnswers(
    questionId: number,
    inflectionAnswers: {
        primaryFeature: number;
        secondaryFeature?: number;
        answer: string;
    }[],
    createdAnswers: InflectionAnswer[],
    transaction: Transaction,
) {
    const answers = [];

    await InflectionAnswer.destroy({ where: { questionId }, transaction });

    for (const inflectionAnswer of inflectionAnswers) {
        answers.push({
            questionId,
            primaryFeatureId: inflectionAnswer.primaryFeature,
            secondaryFeatureId: inflectionAnswer.secondaryFeature ?? null,
            answerText: inflectionAnswer.answer,
        });
    }

    for (const createdAnswer of await InflectionAnswer.bulkCreate(answers, {
        transaction,
    })) {
        createdAnswers.push(createdAnswer.toJSON());
    }

    return createdAnswers;
}

async function updateQuestionWithAnswers(
    requestJSON: UpdateQuestionRequestAPIWithAnswers,
): Promise<{
    body: UpdateQuestionResponseAPI;
    status: number;
}> {
    const {
        id,
        proposedQuestionText,
        proposedMainAnswer,
        proposedOtherAnswers,
    } = requestJSON;

    const createdAnswers: Answer[] = [];

    try {
        await sequelize.transaction(async (t) => {
            await Question.update(
                { questionText: proposedQuestionText },
                {
                    where: { id: id },
                    transaction: t,
                },
            );
            await processPlainAnswers(
                id,
                proposedMainAnswer,
                proposedOtherAnswers,
                createdAnswers,
                t,
            );
        });
    } catch (error) {
        console.log(`error: ${error}`);
        return { body: {} as UpdateQuestionResponseAPI, status: 409 };
    }

    return {
        body: {
            questionId: id,
            questionText: proposedQuestionText,
            answers: createdAnswers,
            inflectionAnswers: [],
        },
        status: 200,
    };
}

async function updateQuestionWithInflectionAnswers(
    requestJSON: UpdateQuestionRequestAPIWithInflectionAnswers,
): Promise<{
    body: UpdateQuestionResponseAPI;
    status: number;
}> {
    const { id, proposedQuestionText, proposedInflectionAnswers } = requestJSON;

    const createdAnswers: InflectionAnswer[] = [];

    try {
        await sequelize.transaction(async (t) => {
            await Question.update(
                { questionText: proposedQuestionText },
                {
                    where: { id: id },
                    transaction: t,
                },
            );
            await processInflectionAnswers(
                id,
                proposedInflectionAnswers,
                createdAnswers,
                t,
            );
        });
    } catch (error) {
        console.log(`error: ${error}`);
        return { body: {} as UpdateQuestionResponseAPI, status: 409 };
    }

    return {
        body: {
            questionId: id,
            questionText: proposedQuestionText,
            answers: [],
            inflectionAnswers: createdAnswers,
        },
        status: 200,
    };
}

export async function POST(request: NextRequest) {
    const requestJSON: UpdateQuestionRequestAPI = await request.json();

    let body: UpdateQuestionResponseAPI;
    let status: number;
    if (
        "proposedMainAnswer" in requestJSON &&
        "proposedOtherAnswers" in requestJSON &&
        !("proposedInflectionAnswers" in requestJSON)
    ) {
        ({ body, status } = await updateQuestionWithAnswers(requestJSON));
    } else if (
        "proposedInflectionAnswers" in requestJSON &&
        !("proposedMainAnswer" in requestJSON) &&
        !("proposedOtherAnswers" in requestJSON)
    ) {
        ({ body, status } =
            await updateQuestionWithInflectionAnswers(requestJSON));
    } else {
        body = {};
        status = 422;
    }

    return NextResponse.json(body, { status });
}
