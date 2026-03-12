import { NextRequest, NextResponse } from "next/server";

import { Question, SheetQuestion } from "@models";

import { DeleteQuestionRequestAPI, DeleteQuestionResponseAPI } from "./api";
import sequelize from "src/db/models/db-connection";

export async function DELETE(request: NextRequest) {
    const requestJSON: DeleteQuestionRequestAPI = await request.json();
    const { id: questionId, sheetId } = requestJSON;

    let deleted = false;

    try {
        await sequelize.transaction(async (t) => {
            const deletedCount = await SheetQuestion.destroy({
                where: { questionId, sheetId },
                transaction: t,
            });

            if (deletedCount === 0) {
                throw new Error("Question not found on this sheet");
            }

            const remainingLinks = await SheetQuestion.count({
                where: { questionId },
                transaction: t,
            });

            if (remainingLinks === 0) {
                await Question.destroy({
                    where: { id: questionId },
                    transaction: t,
                });
                deleted = true;
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            const payload: DeleteQuestionResponseAPI = { error: error.message };
            return NextResponse.json(payload, { status: 409 });
        }
        throw error;
    }

    const payload: DeleteQuestionResponseAPI = { deleted };
    return NextResponse.json(payload, { status: 200 });
}
