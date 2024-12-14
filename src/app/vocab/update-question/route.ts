import { NextRequest, NextResponse } from "next/server";

import { Answer } from "@models";

export async function POST(request: NextRequest) {
    const requestJSON = await request.json();
    const proposedMainAnswer = requestJSON.proposedMainAnswer;
    const questionId = requestJSON.id;

    await Answer.update(
        { answerText: proposedMainAnswer },
        { where: { isMainAnswer: true, questionId: questionId } },
    );

    return NextResponse.json(
        { questionId: questionId, mainAnswer: proposedMainAnswer },
        { status: 200 },
    );
}
