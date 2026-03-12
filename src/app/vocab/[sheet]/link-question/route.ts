import { NextRequest, NextResponse } from "next/server";

import {
    Answer,
    InflectionAnswer,
    Question,
    Result,
    Sheet,
    SheetQuestion,
} from "@models";

import { LinkQuestionRequestAPI, LinkQuestionResponseAPI } from "./api";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sheet: string }> },
) {
    const sheetId = parseInt((await params).sheet);
    const requestJSON: LinkQuestionRequestAPI = await request.json();
    const { questionId } = requestJSON;

    const sheet = await Sheet.findByPk(sheetId);
    if (!sheet) {
        const response: LinkQuestionResponseAPI = { error: "Sheet not found" };
        return NextResponse.json(response, { status: 404 });
    }

    const question = await Question.findByPk(questionId, {
        include: [
            { model: Answer, as: "answers" },
            { model: InflectionAnswer, as: "inflectionAnswers" },
            { model: Result, as: "result" },
        ],
    });

    if (!question) {
        const response: LinkQuestionResponseAPI = {
            error: "Question not found",
        };
        return NextResponse.json(response, { status: 404 });
    }

    if (question.tonguePairId !== sheet.tonguePairId) {
        const response: LinkQuestionResponseAPI = {
            error: "Question does not belong to the same language pair",
        };
        return NextResponse.json(response, { status: 409 });
    }

    const existingLink = await SheetQuestion.findOne({
        where: { sheetId, questionId },
    });

    if (existingLink) {
        const response: LinkQuestionResponseAPI = {
            error: "Question is already linked to this sheet",
        };
        return NextResponse.json(response, { status: 409 });
    }

    await SheetQuestion.create({ sheetId, questionId });

    const response: LinkQuestionResponseAPI = {
        id: question.id,
        questionText: question.questionText,
        isStudyingLanguage: question.isStudyingLanguage,
        tonguePairId: question.tonguePairId,
        inflectionTypeId: question.inflectionTypeId ?? null,
        answers: question.answers ?? [],
        inflectionAnswers: question.inflectionAnswers ?? [],
        result: question.result,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
    };

    return NextResponse.json(response, { status: 200 });
}
