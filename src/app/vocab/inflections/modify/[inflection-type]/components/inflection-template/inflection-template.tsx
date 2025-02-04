import { InflectionType } from "@models";

import styles from "./inflection-template.module.css";

interface InflectionTemplateProps {
    inflectionType: InflectionType;
}

function SingleAxisInflectionTemplate({
    inflectionType,
}: InflectionTemplateProps) {
    const [category] = inflectionType.categories;

    const headers = [];
    const emptyCells = [];
    for (const feature of category.features) {
        headers.push(<th key={feature.id}>{feature.featureName}</th>);
        emptyCells.push(<td key={feature.id}></td>);
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
                <tr>{emptyCells}</tr>
            </tbody>
        </table>
    );
}

function DoubleAxisInflectionTemplate({
    inflectionType,
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
        const emptyCells = [];
        for (const primaryFeature of firstCategory.features) {
            emptyCells.push(<td key={primaryFeature.id}></td>);
        }
        rows.push(
            <tr key={secondaryFeature.id}>
                {leftHeader}
                <th>{secondaryFeature.featureName}</th>
                {emptyCells}
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
}: InflectionTemplateProps) {
    const noAxes = inflectionType.categories.length;
    if (noAxes === 1) {
        return (
            <SingleAxisInflectionTemplate
                inflectionType={inflectionType}
            ></SingleAxisInflectionTemplate>
        );
    } else if (noAxes === 2) {
        return (
            <DoubleAxisInflectionTemplate
                inflectionType={inflectionType}
            ></DoubleAxisInflectionTemplate>
        );
    } else {
        throw new Error(
            `Inflection type should have 1 or 2 categories. Has ${noAxes}!`,
        );
    }
}
