import { NextRequest, NextResponse } from "next/server";
import { Transaction } from "sequelize";

import { Answer, InflectionAnswer, Question } from "@models";

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

export async function POST(request: NextRequest) {
    const requestJSON = await request.json();
    const {
        proposedQuestionText,
        proposedMainAnswer,
        proposedOtherAnswers,
        proposedInflectionType,
        proposedInflectionAnswers,
        id,
    } = requestJSON;

    let usesInflections: boolean;
    const createdAnswers: Answer[] | InflectionAnswer[] = [];
    if (proposedMainAnswer && proposedOtherAnswers !== undefined) {
        usesInflections = false;
    } else if (
        proposedInflectionType &&
        proposedInflectionAnswers !== undefined
    ) {
        usesInflections = true;
    } else {
        return NextResponse.json({}, { status: 422 });
    }

    try {
        await sequelize.transaction(async (t) => {
            await Question.update(
                { questionText: proposedQuestionText },
                {
                    where: { id: id },
                    transaction: t,
                },
            );

            if (usesInflections) {
                await processInflectionAnswers(
                    id,
                    proposedInflectionAnswers,
                    createdAnswers as InflectionAnswer[],
                    t,
                );
            } else {
                await processPlainAnswers(
                    id,
                    proposedMainAnswer,
                    proposedOtherAnswers,
                    createdAnswers as Answer[],
                    t,
                );
            }
        });
    } catch (error) {
        console.log(`error: ${error}`);
        return NextResponse.json({}, { status: 409 });
    }

    return NextResponse.json(
        {
            questionId: id,
            questionText: proposedQuestionText,
            answers: usesInflections ? [] : createdAnswers,
            inflectionAnswers: usesInflections ? createdAnswers : [],
        },
        { status: 200 },
    );
}
