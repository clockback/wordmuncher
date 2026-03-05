import { NextRequest, NextResponse } from "next/server";

import { Answer, InflectionAnswer, Question, Result, Sheet } from "@models";

import { getNumberOfStars, getQuestion } from "../server-helpers";
import { SkipAnswerRequestAPI, SkipAnswerResponseAPI } from "./api";
import { getSettings } from "src/db/helpers/settings";

function stripDiacritics(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sheet: string }> },
) {
    const requestJSON: SkipAnswerRequestAPI = await request.json();
    const sheetId = parseInt((await params).sheet);
    const sheet = await Sheet.findByPk(sheetId);
    const {
        questionId,
        submittedInflectionAnswers,
        lastQuestions,
        retrieveNextAnswer,
    } = requestJSON;

    const question = await Question.findByPk(questionId, {
        include: [
            { model: Answer, as: "answers" },
            { model: InflectionAnswer, as: "inflectionAnswers" },
            { model: Result, as: "result" },
        ],
    });

    if (question.result.current !== 0) {
        return NextResponse.json(
            { error: "Cannot skip a question with existing progress" },
            { status: 400 },
        );
    }

    updateLastQuestions(lastQuestions, questionId);

    const nextQuestion = retrieveNextAnswer
        ? await getQuestion(sheet, lastQuestions)
        : null;
    const totalStars = await getNumberOfStars(sheet);

    let expectedAnswer: string | null = null;
    let inflectionCorrections: { [key: string]: string } | null = null;

    const settings = await getSettings();
    const normalize = settings.ignoreDiacritics
        ? stripDiacritics
        : (str: string) => str;

    if (question.inflectionTypeId === null) {
        for (const answer of question.answers) {
            if (answer.isMainAnswer) {
                expectedAnswer = answer.answerText;
                break;
            }
        }
    } else {
        inflectionCorrections = {};
        for (const answer of question.inflectionAnswers) {
            let featureKey: string;
            if (answer.secondaryFeatureId === null) {
                featureKey = answer.primaryFeatureId.toString();
            } else {
                featureKey = `${answer.primaryFeatureId},${answer.secondaryFeatureId}`;
            }
            if (
                normalize(answer.answerText) !==
                normalize(submittedInflectionAnswers?.[featureKey] ?? "")
            ) {
                inflectionCorrections[featureKey] = answer.answerText;
            }
        }
    }

    const body: SkipAnswerResponseAPI = {
        result: question.result,
        nextQuestion: nextQuestion ? nextQuestion.toJSON() : null,
        lastQuestions,
        expectedAnswer,
        inflectionCorrections,
        totalStars,
    };

    return NextResponse.json(body, { status: 200 });
}
