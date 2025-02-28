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

import {
    AddQuestionRequestAPI,
    AddQuestionRequestAPIWithAnswers,
    AddQuestionRequestAPIWithInflectionAnswers,
    AddQuestionResponseAPI,
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

async function addQuestionWithAnswers(
    sheetId: number,
    requestJSON: AddQuestionRequestAPIWithAnswers,
): Promise<{ body: AddQuestionResponseAPI; status: number }> {
    const { proposedQuestionText, proposedMainAnswer, proposedOtherAnswers } =
        requestJSON;

    const sheet = await Sheet.findByPk(sheetId);

    let newQuestion: Question;
    const createdAnswers: Answer[] = [];
    let result: Result;

    try {
        await sequelize.transaction(async (t) => {
            newQuestion = await Question.create(
                {
                    tonguePairId: sheet.tonguePairId,
                    questionText: proposedQuestionText,
                    inflectionTypeId: null,
                },
                { transaction: t },
            );

            result = await Result.create(
                { questionId: newQuestion.id, stars: 0, current: 0, goal: 2 },
                { transaction: t },
            );

            await SheetQuestion.create(
                { sheetId: sheet.id, questionId: newQuestion.id },
                { transaction: t },
            );

            await processPlainAnswers(
                newQuestion.id,
                proposedMainAnswer,
                proposedOtherAnswers,
                createdAnswers as Answer[],
                t,
            );
        });
    } catch (error) {
        console.log(`error: ${error}`);
        return { body: {}, status: 409 };
    }

    const body: AddQuestionResponseAPI = {
        ...newQuestion.toJSON(),
        answers: createdAnswers,
        inflectionAnswers: [],
        result: result,
    };
    return { body, status: 200 };
}

async function addQuestionWithInflectionAnswers(
    sheetId: number,
    requestJSON: AddQuestionRequestAPIWithInflectionAnswers,
): Promise<{ body: AddQuestionResponseAPI; status: number }> {
    const {
        proposedQuestionText,
        proposedInflectionType,
        proposedInflectionAnswers,
    } = requestJSON;

    const sheet = await Sheet.findByPk(sheetId);

    let newQuestion: Question;
    const createdAnswers: InflectionAnswer[] = [];
    let result: Result;

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

            result = await Result.create(
                { questionId: newQuestion.id, stars: 0, current: 0, goal: 2 },
                { transaction: t },
            );

            await SheetQuestion.create(
                { sheetId: sheet.id, questionId: newQuestion.id },
                { transaction: t },
            );

            await processInflectionAnswers(
                newQuestion.id,
                proposedInflectionAnswers,
                createdAnswers as InflectionAnswer[],
                t,
            );
        });
    } catch (error) {
        console.log(`error: ${error}`);
        return { body: {}, status: 409 };
    }

    const body: AddQuestionResponseAPI = {
        ...newQuestion.toJSON(),
        answers: [],
        inflectionAnswers: createdAnswers,
        result: result,
    };

    return { body, status: 200 };
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sheet: string }> },
) {
    const requestJSON: AddQuestionRequestAPI = await request.json();
    const sheetId = parseInt((await params).sheet);
    let body: AddQuestionResponseAPI;
    let status: number;

    if (
        "proposedMainAnswer" in requestJSON &&
        "proposedOtherAnswers" in requestJSON &&
        !("proposedInflectionAnswers" in requestJSON) &&
        !("proposedInflectionType" in requestJSON)
    ) {
        ({ body, status } = await addQuestionWithAnswers(sheetId, requestJSON));
    } else if (
        "proposedInflectionType" in requestJSON &&
        "proposedInflectionAnswers" in requestJSON &&
        !("proposedMainAnswer" in requestJSON) &&
        !("proposedOtherAnswers" in requestJSON)
    ) {
        ({ body, status } = await addQuestionWithInflectionAnswers(
            sheetId,
            requestJSON,
        ));
    } else {
        body = {};
        status = 422;
    }

    return NextResponse.json(body, { status });
}
