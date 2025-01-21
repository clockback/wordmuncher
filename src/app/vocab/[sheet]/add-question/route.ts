import { NextRequest, NextResponse } from "next/server";

import { Answer, Question, Result, Sheet, SheetQuestion } from "@models";

import sequelize from "src/db/models/db-connection";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sheet: string }> },
) {
    const requestJSON = await request.json();
    const { proposedQuestionText, proposedMainAnswer, proposedOtherAnswers } =
        requestJSON;

    const sheetId = parseInt((await params).sheet);
    const sheet = await Sheet.findByPk(sheetId);

    let newQuestion: Question;
    let sheetQuestion: SheetQuestion;
    const answers: {
        questionId: number;
        isMainAnswer: boolean;
        answerText: string;
    }[] = [];
    const createdAnswers: Answer[] = [];

    try {
        await sequelize.transaction(async (t) => {
            newQuestion = await Question.create(
                {
                    tonguePairId: sheet.tonguePairId,
                    questionText: proposedQuestionText,
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

            answers.push({
                questionId: newQuestion.id,
                isMainAnswer: true,
                answerText: proposedMainAnswer,
            });
            for (const proposedOtherAnswer of proposedOtherAnswers) {
                answers.push({
                    questionId: newQuestion.id,
                    isMainAnswer: false,
                    answerText: proposedOtherAnswer,
                });
            }

            for (const createdAnswer of await Answer.bulkCreate(answers, {
                transaction: t,
            })) {
                createdAnswers.push(createdAnswer.toJSON());
            }
        });
    } catch (error) {
        console.log(`error: ${error}`);
        return NextResponse.json({}, { status: 409 });
    }

    const payload = {
        ...newQuestion.toJSON(),
        SheetQuestions: [sheetQuestion.toJSON()],
        answers: createdAnswers,
    };

    return NextResponse.json(payload, { status: 200 });
}
