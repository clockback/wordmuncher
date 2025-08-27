import { JSX, useContext } from "react";

import InflectionTemplate from "@components/inflection-template/inflection-template";

import { InflectionCategory } from "@models";

import editSheetContext from "../../context";
import EditInflectionAnswer from "../edit-inflection-answer/edit-inflection-answer";
import InflectionPicker from "../inflection-picker/inflection-picker";
import OtherAnswersTable from "../other-answers-table/other-answers-table";
import styles from "./answer-section.module.css";

function generateCellContents(
    categories: InflectionCategory[],
    proposedInflectionAnswers: Map<string, string>,
): Map<string, () => JSX.Element> {
    const cellContents = new Map<string, () => JSX.Element>();

    let [firstCategory, secondCategory] = categories;
    if (!firstCategory.isPrimary) {
        [secondCategory, firstCategory] = categories;
    }

    for (const primaryFeature of firstCategory.features) {
        if (categories.length === 1) {
            const answerKey = primaryFeature.id.toString();
            const answer = proposedInflectionAnswers.get(answerKey) ?? null;
            const answerCellGenerator = () => (
                <EditInflectionAnswer
                    featureIndex={answerKey}
                    proposedAnswer={answer}
                ></EditInflectionAnswer>
            );
            cellContents.set(answerKey, answerCellGenerator);
        } else {
            for (const secondaryFeature of secondCategory.features) {
                const answerKey = `${primaryFeature.id},${secondaryFeature.id}`;
                const answer = proposedInflectionAnswers.get(answerKey) ?? null;
                const answerCellGenerator = () => (
                    <EditInflectionAnswer
                        featureIndex={answerKey}
                        proposedAnswer={answer}
                    ></EditInflectionAnswer>
                );
                cellContents.set(answerKey, answerCellGenerator);
            }
        }
    }
    return cellContents;
}

export default function AnswerSection() {
    const {
        answerEntryValue,
        otherAnswers,
        pending,
        proposedInflectionAnswers,
        proposedInflectionType,
        setAnswerEntryValue,
        setOtherAnswers,
        setSavePossible,
    } = useContext(editSheetContext);

    let beneathHeader = null;

    if (proposedInflectionType === null) {
        const onChangeAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
            setSavePossible(true);
            setAnswerEntryValue(e.target.value);
        };
        const onBlurAnswer = () => {
            if (!otherAnswers.includes(answerEntryValue.trim())) {
                return;
            }
            const newOtherAnswers = Object.assign([], otherAnswers);
            newOtherAnswers.splice(
                newOtherAnswers.indexOf(answerEntryValue.trim()),
                1,
            );
            setOtherAnswers(newOtherAnswers);
        };

        beneathHeader = (
            <>
                <input
                    className={styles.answerentry}
                    value={answerEntryValue}
                    onChange={onChangeAnswer}
                    onBlur={onBlurAnswer}
                    name="main-answer"
                    title="Main answer"
                    disabled={pending}
                ></input>
                <h3>Other accepted answers:</h3>
                <OtherAnswersTable></OtherAnswersTable>
            </>
        );
    } else {
        const cellContents = generateCellContents(
            proposedInflectionType.categories,
            proposedInflectionAnswers,
        );

        beneathHeader = (
            <div>
                <InflectionTemplate
                    inflectionType={proposedInflectionType}
                    cellContents={cellContents}
                ></InflectionTemplate>
            </div>
        );
    }

    return (
        <>
            <h2>Answer</h2>
            <InflectionPicker></InflectionPicker>
            {beneathHeader}
        </>
    );
}
