import { NextRequest, NextResponse } from "next/server";

import { Answer, Question } from "@models";

import sequelize from "src/db/models/db-connection";

export async function POST(request: NextRequest) {
    const requestJSON = await request.json();
    const {
        proposedQuestionText,
        proposedMainAnswer,
        proposedOtherAnswers,
        id,
    } = requestJSON;

    const allOtherAnswers: {
        questionId: number;
        isMainAnswer: boolean;
        answerText: string;
    }[] = [];
    for (const proposedOtherAnswer of proposedOtherAnswers) {
        allOtherAnswers.push({
            questionId: id,
            isMainAnswer: false,
            answerText: proposedOtherAnswer,
        });
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
            await Answer.destroy({
                where: { isMainAnswer: false, questionId: id },
                transaction: t,
            });
            await Answer.update(
                { answerText: proposedMainAnswer },
                {
                    where: { questionId: id },
                    transaction: t,
                },
            );
            await Answer.bulkCreate(allOtherAnswers, { transaction: t });
        });
    } catch (error) {
        console.log(`error: ${error}`);
        return NextResponse.json({}, { status: 409 });
    }

    return NextResponse.json(
        {
            questionId: id,
            questionText: proposedQuestionText,
            mainAnswer: proposedMainAnswer,
            otherAnswers: proposedOtherAnswers,
        },
        { status: 200 },
    );
}
