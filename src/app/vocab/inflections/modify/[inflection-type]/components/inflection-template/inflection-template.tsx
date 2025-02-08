import { InflectionType, Question } from "@models";

import styles from "./inflection-template.module.css";

interface InflectionTemplateProps {
    inflectionType: InflectionType;
    representativeQuestion: Question;
}

function SingleAxisInflectionTemplate({
    inflectionType,
    representativeQuestion,
}: InflectionTemplateProps) {
    const [category] = inflectionType.categories;

    const headers = [];
    const answerCells = [];
    for (const feature of category.features) {
        let text = "";
        for (const answer of representativeQuestion.inflectionAnswers) {
            if (answer.primaryFeatureId === feature.id) {
                text = answer.answerText;
                break;
            }
        }
        headers.push(<th key={feature.id}>{feature.featureName}</th>);
        answerCells.push(<td key={feature.id}>{text}</td>);
    }

    return (
        <table className={styles.singleaxis}>
            <thead>
                <tr>
                    <th colSpan={category.features.length}>
                        {category.categoryName}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>{headers}</tr>
                <tr>{answerCells}</tr>
            </tbody>
        </table>
    );
}

function DoubleAxisInflectionTemplate({
    inflectionType,
    representativeQuestion,
}: InflectionTemplateProps) {
    let [firstCategory, secondCategory] = inflectionType.categories;
    if (!firstCategory.isPrimary) {
        [secondCategory, firstCategory] = inflectionType.categories;
    }

    const headers = [];
    for (const primaryFeature of firstCategory.features) {
        headers.push(
            <th key={primaryFeature.id}>{primaryFeature.featureName}</th>,
        );
    }

    const rows = [];
    let leftHeader = (
        <th rowSpan={secondCategory.features.length}>
            {secondCategory.categoryName}
        </th>
    );
    for (const secondaryFeature of secondCategory.features) {
        const answerCells = [];
        for (const primaryFeature of firstCategory.features) {
            let text = "";
            for (const answer of representativeQuestion.inflectionAnswers) {
                if (
                    answer.primaryFeatureId === primaryFeature.id &&
                    answer.secondaryFeatureId === secondaryFeature.id
                ) {
                    text = answer.answerText;
                    break;
                }
            }
            answerCells.push(<td key={primaryFeature.id}>{text}</td>);
        }
        rows.push(
            <tr key={secondaryFeature.id}>
                {leftHeader}
                <th>{secondaryFeature.featureName}</th>
                {answerCells}
            </tr>,
        );
        leftHeader = null;
    }

    return (
        <table className={styles.doubleaxis}>
            <thead>
                <tr>
                    <td rowSpan={2} colSpan={2}></td>
                    <th colSpan={firstCategory.features.length}>
                        {firstCategory.categoryName}
                    </th>
                </tr>
                <tr>{headers}</tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
}

export default function InflectionTemplate({
    inflectionType,
    representativeQuestion,
}: InflectionTemplateProps) {
    const noAxes = inflectionType.categories.length;
    if (noAxes === 1) {
        return (
            <SingleAxisInflectionTemplate
                inflectionType={inflectionType}
                representativeQuestion={representativeQuestion}
            ></SingleAxisInflectionTemplate>
        );
    } else if (noAxes === 2) {
        return (
            <DoubleAxisInflectionTemplate
                inflectionType={inflectionType}
                representativeQuestion={representativeQuestion}
            ></DoubleAxisInflectionTemplate>
        );
    } else {
        throw new Error(
            `Inflection type should have 1 or 2 categories. Has ${noAxes}!`,
        );
    }
}
