import { NextRequest, NextResponse } from "next/server";
import { Transaction } from "sequelize";

import {
    Answer,
    InflectionAnswer,
    Question,
    Result,
    Sheet,
    SheetQuestion,
} from "@models";

import sequelize from "src/db/models/db-connection";

async function processPlainAnswers(
    questionId: number,
    mainAnswer: string,
    otherAnswers: string[],
    createdAnswers: Answer[],
    transaction: Transaction,
) {
    const answers = [];

    answers.push({
        questionId: questionId,
        isMainAnswer: true,
        answerText: mainAnswer,
    });
    for (const proposedOtherAnswer of otherAnswers) {
        answers.push({
            questionId: questionId,
            isMainAnswer: false,
            answerText: proposedOtherAnswer,
        });
    }

    for (const createdAnswer of await Answer.bulkCreate(answers, {
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

    for (const inflectionAnswer of inflectionAnswers) {
        answers.push({
            questionId,
            primaryFeatureId: inflectionAnswer.primaryFeature,
            secondaryFeatureId: inflectionAnswer.secondaryFeature,
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

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sheet: string }> },
) {
    const requestJSON = await request.json();
    const {
        proposedQuestionText,
        proposedMainAnswer,
        proposedOtherAnswers,
        proposedInflectionType,
        proposedInflectionAnswers,
    } = requestJSON;

    const sheetId = parseInt((await params).sheet);
    const sheet = await Sheet.findByPk(sheetId);

    let newQuestion: Question;
    let sheetQuestion: SheetQuestion;
    const createdAnswers: Answer[] | InflectionAnswer[] = [];
    let usesInflections: boolean;
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
            newQuestion = await Question.create(
                {
                    tonguePairId: sheet.tonguePairId,
                    questionText: proposedQuestionText,
                    inflectionTypeId: proposedInflectionType,
                },
                { transaction: t },
            );

            newQuestion.result = await Result.create(
                { questionId: newQuestion.id, stars: 0, current: 0, goal: 2 },
                { transaction: t },
            );

            sheetQuestion = await SheetQuestion.create(
                { sheetId: sheet.id, questionId: newQuestion.id },
                { transaction: t },
            );

            if (usesInflections) {
                await processInflectionAnswers(
                    newQuestion.id,
                    proposedInflectionAnswers,
                    createdAnswers as InflectionAnswer[],
                    t,
                );
            } else {
                await processPlainAnswers(
                    newQuestion.id,
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

    const payload = {
        ...newQuestion.toJSON(),
        SheetQuestions: [sheetQuestion.toJSON()],
        answers: usesInflections ? [] : createdAnswers,
        inflectionAnswers: usesInflections ? createdAnswers : [],
    };

    return NextResponse.json(payload, { status: 200 });
}
