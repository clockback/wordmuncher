import { Op, col } from "sequelize";

import { Question, Result, Sheet } from "@models";

import sequelize from "src/db/models/db-connection";

async function getPartiallySolvedQuestion(
    sheet: Sheet,
    lastQuestions: number[],
): Promise<Question | null> {
    const [question] = await Question.findAll({
        where: { id: { [Op.notIn]: lastQuestions } },
        include: [
            {
                model: Result,
                where: { [Op.not]: { current: col("goal") } },
                as: "result",
            },
            { model: Sheet, where: { id: sheet.id }, as: "sheets" },
        ],
        order: sequelize.random(),
        limit: 1,
    });

    return question ?? null;
}

async function getNonSolvedQuestion(
    sheet: Sheet,
    lastQuestions: number[],
): Promise<Question | null> {
    const [question] = await Question.findAll({
        where: { id: { [Op.notIn]: lastQuestions } },
        include: [
            {
                model: Result,
                where: { [Op.not]: { current: 0 } },
                as: "result",
            },
            { model: Sheet, where: { id: sheet.id }, as: "sheets" },
        ],
        order: sequelize.random(),
        limit: 1,
    });

    return question ?? null;
}

async function getSolvedQuestion(
    sheet: Sheet,
    lastQuestions: number[],
): Promise<Question | null> {
    const [question] = await Question.findAll({
        where: { id: { [Op.notIn]: lastQuestions } },
        include: [
            { model: Result, as: "result" },
            { model: Sheet, where: { id: sheet.id }, as: "sheets" },
        ],
        order: sequelize.random(),
        limit: 1,
    });

    return question ?? null;
}

export async function getQuestion(
    sheet: Sheet,
    lastQuestions: number[],
): Promise<Question> {
    let question =
        (await getPartiallySolvedQuestion(sheet, lastQuestions)) ??
        (await getNonSolvedQuestion(sheet, lastQuestions)) ??
        (await getSolvedQuestion(sheet, lastQuestions));

    if (question !== null) {
        return question;
    } else if (lastQuestions.length === 0) {
        throw new Error(`No questions for sheet "${sheet.sheetName}"`);
    } else {
        return await Question.findByPk(lastQuestions[0], {
            include: [
                { model: Result, as: "result" },
                { model: Sheet, where: { id: sheet.id }, as: "sheets" },
            ],
        });
    }
}
