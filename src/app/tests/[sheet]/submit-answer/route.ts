import { NextRequest, NextResponse } from "next/server";

import { Answer, Question, Result, Sheet } from "@models";

import { getQuestion } from "../helpers";

function markCorrect(result: Result) {
    if (result.current === 2 && result.goal === 2) {
        return;
    }
    result.current++;

    if (result.current === result.goal) {
        result.current = 2;
        result.goal = 2;
    }

    result.save();
}

function markIncorrect(result: Result) {
    result.current = 0;
    result.goal = Math.min(5, result.goal + 1);

    result.save();
}

function updateLastQuestions(lastQuestions: number[], questionId: number) {
    if (lastQuestions.length > 2) {
        lastQuestions = lastQuestions.slice(1, 3);
    }
    const index = lastQuestions.indexOf(questionId);
    if (index !== -1) {
        lastQuestions.splice(index, 1);
    }
    if (!lastQuestions.includes(questionId)) {
    }
    lastQuestions.push(questionId);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sheet: string }> },
) {
    const requestJSON = await request.json();
    const questionId = requestJSON.questionId;
    const submittedAnswer = requestJSON.submittedAnswer;
    let lastQuestions = requestJSON.lastQuestions;
    const sheetId = parseInt((await params).sheet);

    const question = await Question.findByPk(questionId, {
        include: [
            { model: Answer, as: "answers" },
            { model: Result, as: "result" },
        ],
    });
    let correct = false;
    for (let answer of question.answers) {
        if (submittedAnswer === answer.answerText) {
            correct = true;
            break;
        }
    }

    if (correct) {
        markCorrect(question.result);
    } else {
        markIncorrect(question.result);
    }

    updateLastQuestions(lastQuestions, questionId);

    const sheet = await Sheet.findByPk(sheetId);
    const nextQuestion = await getQuestion(sheet, lastQuestions);

    return NextResponse.json(
        {
            correct: correct,
            nextQuestion: nextQuestion.toJSON(),
            lastQuestions: lastQuestions,
        },
        { status: 202 },
    );
}
