import { notFound } from "next/navigation";

import Button from "@components/button/button";

import { Category, Question, Result, Sheet } from "@models";

import TestSheetTable from "./components/test-sheet-table/test-sheet-table";
import styles from "./tests.module.css";
import {
    CategoryTreeData,
    FlatCategory,
    SheetNode,
    buildCategoryTree,
    pruneEmptyCategories,
} from "src/app/lib/category-tree";
import { getSettings } from "src/db/helpers/settings";

async function getAllSheets(): Promise<Sheet[]> {
    "use server";
    const settings = await getSettings();

    return await Sheet.findAll({
        where: { tonguePairId: settings.tonguePairId },
        include: [
            {
                model: Question,
                as: "questions",
                include: [{ model: Result, as: "result" }],
            },
        ],
    });
}

async function getCategories(): Promise<FlatCategory[]> {
    "use server";
    const settings = await getSettings();

    const categories = await Category.findAll({
        where: { tonguePairId: settings.tonguePairId },
        order: [
            ["displayOrder", "ASC"],
            ["categoryName", "ASC"],
        ],
    });

    return categories.map((cat) => ({
        id: cat.id,
        categoryName: cat.categoryName,
        parentCategoryId: cat.parentCategoryId,
        depth: cat.depth,
    }));
}

async function getSheetsByProgress(): Promise<SheetNode[]> {
    "use server";
    const sheetsWithoutProgress = await getAllSheets();
    const sheets: SheetNode[] = [];

    for (const sheet of sheetsWithoutProgress) {
        let progressTotal = 0;
        const questionCount = sheet.questions.length;

        if (questionCount === 0) {
            continue;
        }

        for (const question of sheet.questions) {
            const result = question.result;
            if (result === null) {
                continue;
            }
            const isCompleted = result.current == result.goal;
            const currentStars = result.stars + Number(isCompleted);
            const targetStars = result.stars + 1;
            progressTotal += currentStars / targetStars;
        }

        const progress = questionCount ? progressTotal / questionCount : 0;

        sheets.push({
            sheetId: sheet.id,
            sheetName: sheet.sheetName,
            categoryId: sheet.categoryId,
            progress,
        });
    }
    return sheets;
}

async function getTreeData(): Promise<CategoryTreeData> {
    "use server";
    const [sheets, categories] = await Promise.all([
        getSheetsByProgress(),
        getCategories(),
    ]);
    const tree = buildCategoryTree(categories, sheets);
    return {
        roots: pruneEmptyCategories(tree.roots),
        uncategorizedSheets: tree.uncategorizedSheets,
    };
}

export default async function Tests() {
    let treeData: CategoryTreeData;
    try {
        treeData = await getTreeData();
    } catch (error) {
        console.error("Tests page error:", error);
        return notFound();
    }

    return (
        <div className={styles.centre}>
            <h1>Select a sheet</h1>
            <TestSheetTable treeData={treeData}></TestSheetTable>
            <div className={styles.buttonmargin}>
                <Button href="/">Back</Button>
            </div>
        </div>
    );
}

export const dynamic = "force-dynamic";
