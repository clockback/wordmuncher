import { JSX } from "react";

import { InflectionType } from "@models";

import styles from "./inflection-template.module.css";

interface InflectionTemplateProps {
    inflectionType: InflectionType;
    cellContents: Map<string, () => JSX.Element> | null;
}

function SingleAxisInflectionTemplate({
    inflectionType,
    cellContents,
}: InflectionTemplateProps) {
    const [category] = inflectionType.categories;

    const headers = [];
    const answerCells = [];
    const finalCellContents = cellContents
        ? cellContents
        : new Map<string, () => JSX.Element>();

    for (const feature of category.features) {
        headers.push(<th key={feature.id}>{feature.featureName}</th>);
        const cellContentGenerator = finalCellContents.get(
            feature.id.toString(),
        );
        const contents = cellContentGenerator ? cellContentGenerator() : null;
        answerCells.push(<td key={feature.id}>{contents}</td>);
    }

    return (
        <div className={styles.wrapper}>
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
        </div>
    );
}

function DoubleAxisInflectionTemplate({
    inflectionType,
    cellContents,
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

    const finalCellContents = cellContents
        ? cellContents
        : new Map<string, () => JSX.Element>();

    for (const secondaryFeature of secondCategory.features) {
        const answerCells = [];
        for (const primaryFeature of firstCategory.features) {
            const cellContentGenerator = finalCellContents.get(
                `${primaryFeature.id},${secondaryFeature.id}`,
            );
            const contents = cellContentGenerator
                ? cellContentGenerator()
                : null;
            answerCells.push(<td key={primaryFeature.id}>{contents}</td>);
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
        <div className={styles.wrapper}>
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
        </div>
    );
}

export default function InflectionTemplate({
    inflectionType,
    cellContents,
}: InflectionTemplateProps) {
    const noAxes = inflectionType.categories.length;
    if (noAxes === 1) {
        return (
            <SingleAxisInflectionTemplate
                inflectionType={inflectionType}
                cellContents={cellContents}
            ></SingleAxisInflectionTemplate>
        );
    } else if (noAxes === 2) {
        return (
            <DoubleAxisInflectionTemplate
                inflectionType={inflectionType}
                cellContents={cellContents}
            ></DoubleAxisInflectionTemplate>
        );
    } else {
        throw new Error(
            `Inflection type should have 1 or 2 categories. Has ${noAxes}!`,
        );
    }
}
