import { NextRequest, NextResponse } from "next/server";

import { Answer, Question } from "@models";

import sequelize from "src/db/models/db-connection";

export async function POST(request: NextRequest) {
    const requestJSON = await request.json();
    const proposedQuestionText = requestJSON.proposedQuestionText;
    const proposedMainAnswer = requestJSON.proposedMainAnswer;
    const proposedOtherAnswers = requestJSON.proposedOtherAnswers;
    const questionId = requestJSON.id;

    const allOtherAnswers: {
        questionId: number;
        isMainAnswer: boolean;
        answerText: string;
    }[] = [];
    for (const proposedOtherAnswer of proposedOtherAnswers) {
        allOtherAnswers.push({
            questionId: questionId,
            isMainAnswer: false,
            answerText: proposedOtherAnswer,
        });
    }

    try {
        await sequelize.transaction(async (t) => {
            await Question.update(
                { questionText: proposedQuestionText },
                {
                    where: { id: questionId },
                    transaction: t,
                },
            );
            await Answer.destroy({
                where: { isMainAnswer: false, questionId: questionId },
                transaction: t,
            });
            await Answer.update(
                { answerText: proposedMainAnswer },
                {
                    where: { questionId: questionId },
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
            questionId: questionId,
            questionText: proposedQuestionText,
            mainAnswer: proposedMainAnswer,
            otherAnswers: proposedOtherAnswers,
        },
        { status: 200 },
    );
}
