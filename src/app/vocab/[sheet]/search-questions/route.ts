import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";

import { Answer, Question, Sheet, SheetQuestion } from "@models";

import { SearchQuestionResult, SearchQuestionsResponseAPI } from "./api";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sheet: string }> },
) {
    const sheetId = parseInt((await params).sheet);
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
        const response: SearchQuestionsResponseAPI = { questions: [] };
        return NextResponse.json(response, { status: 200 });
    }

    const sheet = await Sheet.findByPk(sheetId);
    if (!sheet) {
        return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    }

    const linkedQuestionIds = await SheetQuestion.findAll({
        where: { sheetId },
        attributes: ["questionId"],
    });
    const excludeIds = linkedQuestionIds.map((sq) => sq.questionId);

    const questions = await Question.findAll({
        where: {
            tonguePairId: sheet.tonguePairId,
            questionText: { [Op.like]: `%${query}%` },
            ...(excludeIds.length > 0 && { id: { [Op.notIn]: excludeIds } }),
        },
        include: [
            { model: Sheet, as: "sheets", attributes: ["sheetName"] },
            {
                model: Answer,
                as: "answers",
                where: { isMainAnswer: true },
                required: false,
            },
        ],
        limit: 5,
        order: [["questionText", "ASC"]],
    });

    const results: SearchQuestionResult[] = questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        isStudyingLanguage: q.isStudyingLanguage,
        sheetNames: q.sheets?.map((s) => s.sheetName) ?? [],
        mainAnswer: q.answers?.[0]?.answerText ?? "",
    }));

    const response: SearchQuestionsResponseAPI = { questions: results };
    return NextResponse.json(response, { status: 200 });
}
