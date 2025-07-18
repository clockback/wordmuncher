import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";

import { Answer, InflectionAnswer, Question, Result, Sheet } from "@models";

import { getNumberOfStars, getQuestion } from "../server-helpers";
import {
    SubmitAnswerRequestAPI,
    SubmitAnswerResponseAPI,
    SubmitAnswerResponseAPICorrectOrIncorrect,
} from "./api";

const minimumSimilarityScore = 0.85;

function markCorrect(result: Result) {
    if (result.current === 2 && result.goal === 2) {
        return;
    }
    result.current++;

    if (result.current === result.goal) {
        result.current = 2;
        result.goal = 2;
        result.gotStarAt ??= new Date();
    }

    result.save();
}

function markIncorrect(result: Result) {
    result.current = 0;
    result.goal = Math.min(5, result.goal + 1);
    result.gotStarAt = null;

    result.save();
}

function updateLastQuestions(lastQuestions: number[], questionId: number) {
    if (lastQuestions.length > 2) {
        lastQuestions.shift();
    }
    const index = lastQuestions.indexOf(questionId);
    if (index !== -1) {
        lastQuestions.splice(index, 1);
    }
    lastQuestions.push(questionId);
}

function editDistance(longerString: string, shorterString: string): number {
    const costs = [];

    for (let shortI = 0; shortI <= longerString.length; shortI++) {
        let lastValue = shortI;
        for (let longI = 0; longI <= shorterString.length; longI++) {
            if (shortI == 0) {
                costs[longI] = longI;
            } else if (longI > 0) {
                let newValue = costs[longI - 1];
                if (longerString[shortI - 1] != shorterString[longI - 1]) {
                    newValue = Math.min(newValue, lastValue, costs[longI]) + 1;
                }
                costs[longI - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (shortI > 0) {
            costs[shorterString.length] = lastValue;
        }
    }

    return costs[shorterString.length];
}

function stringSimilarity(string1: string, string2: string): number {
    let longer: string;
    let shorter: string;
    if (string1.length > string2.length) {
        longer = string1;
        shorter = string2;
    } else {
        longer = string2;
        shorter = string1;
    }

    if (longer.length === 0) {
        return 1.0;
    }
    return (longer.length - editDistance(longer, shorter)) / longer.length;
}

async function finishedSheet(
    sheet: Sheet,
    lastQuestion: Question,
): Promise<boolean> {
    if (lastQuestion.result.gotStarAt === null) {
        return false;
    }

    const incompleteQuestion = await Question.findOne({
        where: {
            id: { [Op.not]: lastQuestion.id },
        },
        include: [
            { model: Result, as: "result", where: { gotStarAt: null } },
            { model: Sheet, where: { id: sheet.id }, as: "sheets" },
        ],
    });

    return incompleteQuestion === null;
}

async function submitPlainAnswer(
    requestJSON: SubmitAnswerRequestAPI,
    sheet: Sheet,
    question: Question,
): Promise<{
    body: SubmitAnswerResponseAPI;
    status: number;
}> {
    const {
        questionId,
        submittedAnswer,
        lastQuestions,
        attemptedAlready,
        retrieveNextAnswer,
    } = requestJSON;

    let correct = false;
    let closest = null;
    let closestScore = null;
    let mainAnswer: string | null = null;
    for (const answer of question.answers) {
        if (submittedAnswer === answer.answerText) {
            correct = true;
            closest = answer;
            closestScore = 1.0;
            break;
        }

        const score = stringSimilarity(submittedAnswer, answer.answerText);
        if (score > closestScore) {
            closestScore = score;
            closest = answer;
        }

        if (answer.isMainAnswer) {
            mainAnswer = answer.answerText;
        }
    }

    if (correct) {
        markCorrect(question.result);
    } else if (closestScore < minimumSimilarityScore || attemptedAlready) {
        markIncorrect(question.result);
    } else {
        const body: SubmitAnswerResponseAPI = {
            correct: false,
            reattemptAvailable: true,
        };
        return { body, status: 202 };
    }

    updateLastQuestions(lastQuestions, questionId);

    const nextQuestion = retrieveNextAnswer
        ? await getQuestion(sheet, lastQuestions)
        : null;
    const totalStars = await getNumberOfStars(sheet);
    const done = correct && (await finishedSheet(sheet, question));
    let expectedAnswer: string | null;
    if (correct) {
        expectedAnswer = null;
    } else if (closestScore > minimumSimilarityScore) {
        expectedAnswer = closest.answerText;
    } else {
        expectedAnswer = mainAnswer;
    }

    const body: SubmitAnswerResponseAPICorrectOrIncorrect = {
        correct: correct,
        result: question.result,
        nextQuestion: nextQuestion ? nextQuestion.toJSON() : null,
        lastQuestions: lastQuestions,
        expectedAnswer,
        inflectionCorrections: null,
        reattemptAvailable: false,
        totalStars,
        done,
    };
    return { body, status: 202 };
}

async function submitInflectionAnswers(
    requestJSON: SubmitAnswerRequestAPI,
    sheet: Sheet,
    question: Question,
): Promise<{
    body: SubmitAnswerResponseAPICorrectOrIncorrect;
    status: number;
}> {
    const { submittedInflectionAnswers, lastQuestions, retrieveNextAnswer } =
        requestJSON;

    let correct = true;

    const inflectionCorrections = {};
    for (const answer of question.inflectionAnswers) {
        let featureKey: string;
        if (answer.secondaryFeatureId === null) {
            featureKey = answer.primaryFeatureId.toString();
        } else {
            featureKey = `${answer.primaryFeatureId},${answer.secondaryFeatureId}`;
        }
        if (answer.answerText !== submittedInflectionAnswers[featureKey]) {
            inflectionCorrections[featureKey] = answer.answerText;
            correct = false;
        }
    }

    updateLastQuestions(lastQuestions, requestJSON.questionId);

    const markFunc = correct ? markCorrect : markIncorrect;
    markFunc(question.result);
    const nextQuestion = retrieveNextAnswer
        ? await getQuestion(sheet, lastQuestions)
        : null;
    const totalStars = await getNumberOfStars(sheet);
    const done = correct && (await finishedSheet(sheet, question));

    return {
        body: {
            correct,
            result: question.result,
            nextQuestion: nextQuestion ? nextQuestion.toJSON() : null,
            lastQuestions,
            expectedAnswer: null,
            inflectionCorrections,
            reattemptAvailable: false,
            totalStars,
            done,
        },
        status: 202,
    };
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sheet: string }> },
) {
    const requestJSON: SubmitAnswerRequestAPI = await request.json();
    const sheetId = parseInt((await params).sheet);
    const sheet = await Sheet.findByPk(sheetId);
    const { questionId } = requestJSON;

    const question = await Question.findByPk(questionId, {
        include: [
            { model: Answer, as: "answers" },
            { model: InflectionAnswer, as: "inflectionAnswers" },
            { model: Result, as: "result" },
        ],
    });

    let body: SubmitAnswerResponseAPI;
    let status: number;

    if (question.inflectionTypeId === null) {
        ({ body, status } = await submitPlainAnswer(
            requestJSON,
            sheet,
            question,
        ));
    } else {
        ({ body, status } = await submitInflectionAnswers(
            requestJSON,
            sheet,
            question,
        ));
    }

    return NextResponse.json(body, { status: status });
}
