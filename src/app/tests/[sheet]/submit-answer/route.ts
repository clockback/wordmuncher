import { NextRequest, NextResponse } from "next/server";

import { Answer, Question, Result, Sheet } from "@models";

import { getQuestion } from "../helpers";

const minimumSimilarityScore = 0.85;

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

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sheet: string }> },
) {
    const requestJSON = await request.json();
    const questionId = requestJSON.questionId;
    const submittedAnswer = requestJSON.submittedAnswer;
    const lastQuestions = requestJSON.lastQuestions;
    const attemptedAlready = requestJSON.attemptedAlready;
    const sheetId = parseInt((await params).sheet);

    const question = await Question.findByPk(questionId, {
        include: [
            { model: Answer, as: "answers" },
            { model: Result, as: "result" },
        ],
    });
    let correct = false;
    let closest = null;
    let closestScore = null;
    let mainAnswer = null;
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
            mainAnswer = answer;
        }
    }

    if (correct) {
        markCorrect(question.result);
    } else if (closestScore < minimumSimilarityScore || attemptedAlready) {
        markIncorrect(question.result);
    } else {
        return NextResponse.json(
            {
                correct: false,
                reattemptAvailable: true,
                closest: closest,
            },
            { status: 202 },
        );
    }

    updateLastQuestions(lastQuestions, questionId);

    const sheet = await Sheet.findByPk(sheetId);
    const nextQuestion = await getQuestion(sheet, lastQuestions);
    let expectedAnswer: Answer;
    if (correct || closestScore > minimumSimilarityScore) {
        expectedAnswer = closest.toJSON();
    } else {
        expectedAnswer = mainAnswer.toJSON();
    }

    return NextResponse.json(
        {
            correct: correct,
            result: question.result,
            nextQuestion: nextQuestion.toJSON(),
            lastQuestions: lastQuestions,
            expectedAnswer: expectedAnswer,
            reattemptAvailable: false,
        },
        { status: 202 },
    );
}
