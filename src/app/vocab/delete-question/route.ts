import { NextRequest, NextResponse } from "next/server";

import { Question } from "@models";

export async function DELETE(request: NextRequest) {
    const requestJSON = await request.json();
    const questionId = requestJSON.id;

    const noDeleted = await Question.destroy({ where: { id: questionId } });

    if (noDeleted === 0) {
        return NextResponse.json(
            { error: `Sheet does not exist with id ${questionId}` },
            { status: 409 },
        );
    }

    return NextResponse.json({}, { status: 200 });
}
