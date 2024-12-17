import { NextRequest, NextResponse } from "next/server";

import { Answer, Question } from "@models";

import sequelize from "src/db/models/db-connection";

export async function POST(request: NextRequest) {
    const requestJSON = await request.json();
    const proposedQuestionText = requestJSON.proposedQuestionText;
    const proposedMainAnswer = requestJSON.proposedMainAnswer;
    const questionId = requestJSON.id;

    try {
        await sequelize.transaction(async (t) => {
            await Question.update(
                { questionText: proposedQuestionText },
                {
                    where: { id: questionId },
                    transaction: t,
                },
            );
            await Answer.update(
                { answerText: proposedMainAnswer },
                {
                    where: { isMainAnswer: true, questionId: questionId },
                    transaction: t,
                },
            );
        });
    } catch (error) {
        return NextResponse.json({}, { status: 409 });
    }

    return NextResponse.json(
        {
            questionId: questionId,
            questionText: proposedQuestionText,
            mainAnswer: proposedMainAnswer,
        },
        { status: 200 },
    );
}
