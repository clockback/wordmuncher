import { NextRequest, NextResponse } from "next/server";

import { Question } from "@models";

import { DeleteQuestionRequestAPI, DeleteQuestionResponseAPI } from "./api";

export async function DELETE(request: NextRequest) {
    const requestJSON: DeleteQuestionRequestAPI = await request.json();
    const { id: questionId } = requestJSON;

    const noDeleted = await Question.destroy({ where: { id: questionId } });

    let payload: DeleteQuestionResponseAPI;
    let statusCode: number;
    if (noDeleted === 0) {
        payload = { error: `Sheet does not exist with id ${questionId}` };
        statusCode = 409;
    } else {
        payload = {};
        statusCode = 200;
    }

    return NextResponse.json(payload, { status: statusCode });
}
