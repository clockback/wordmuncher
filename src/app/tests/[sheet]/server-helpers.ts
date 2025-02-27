import { Op, col } from "sequelize";

import {
    InflectionAnswer,
    InflectionCategory,
    InflectionFeature,
    InflectionType,
    Question,
    Result,
    Sheet,
} from "@models";

import sequelize from "src/db/models/db-connection";

async function getPartiallySolvedQuestion(
    sheet: Sheet,
    lastQuestions: number[],
): Promise<Question | null> {
    const [question] = await Question.findAll({
        where: { id: { [Op.notIn]: lastQuestions } },
        include: [
            { model: Result, where: { goal: { [Op.gt]: 2 } }, as: "result" },
            { model: Sheet, where: { id: sheet.id }, as: "sheets" },
            {
                model: InflectionAnswer,
                as: "inflectionAnswers",
                attributes: { exclude: ["answerText"] },
            },
            {
                model: InflectionType,
                as: "inflectionType",
                include: [
                    {
                        model: InflectionCategory,
                        as: "categories",
                        separate: true,
                        order: [col("isPrimary")],
                        include: [
                            {
                                model: InflectionFeature,
                                as: "features",
                                separate: true,
                                order: [col("orderInCategory")],
                            },
                        ],
                    },
                ],
            },
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
            { model: Result, where: { current: { [Op.lt]: 2 } }, as: "result" },
            { model: Sheet, where: { id: sheet.id }, as: "sheets" },
            {
                model: InflectionAnswer,
                as: "inflectionAnswers",
                attributes: { exclude: ["answerText"] },
            },
            {
                model: InflectionType,
                as: "inflectionType",
                include: [
                    {
                        model: InflectionCategory,
                        as: "categories",
                        separate: true,
                        order: [col("isPrimary")],
                        include: [
                            {
                                model: InflectionFeature,
                                as: "features",
                                separate: true,
                                order: [col("orderInCategory")],
                            },
                        ],
                    },
                ],
            },
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
            {
                model: InflectionAnswer,
                as: "inflectionAnswers",
                attributes: { exclude: ["answerText"] },
            },
            {
                model: InflectionType,
                as: "inflectionType",
                include: [
                    {
                        model: InflectionCategory,
                        as: "categories",
                        separate: true,
                        order: [col("isPrimary")],
                        include: [
                            {
                                model: InflectionFeature,
                                as: "features",
                                separate: true,
                                order: [col("orderInCategory")],
                            },
                        ],
                    },
                ],
            },
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
    const question =
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
                {
                    model: InflectionAnswer,
                    as: "inflectionAnswers",
                    attributes: { exclude: ["answerText"] },
                },
                {
                    model: InflectionType,
                    as: "inflectionType",
                    include: [
                        {
                            model: InflectionCategory,
                            as: "categories",
                            separate: true,
                            order: [col("isPrimary")],
                            include: [
                                {
                                    model: InflectionFeature,
                                    as: "features",
                                    separate: true,
                                    order: [col("orderInCategory")],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    }
}

export async function getNumberOfStars(sheet: Sheet): Promise<number> {
    const results = await Result.findAll({
        include: [
            {
                model: Question,
                as: "question",
                include: [
                    {
                        model: Sheet,
                        where: { id: sheet.id },
                        as: "sheets",
                    },
                ],
            },
        ],
    });

    let numberOfStars = 0;
    for (const result of results) {
        numberOfStars += result.stars;
        if (result.current === 2 && result.goal === 2) {
            numberOfStars++;
        }
    }

    return numberOfStars;
}
