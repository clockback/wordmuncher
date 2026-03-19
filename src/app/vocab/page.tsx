import { notFound } from "next/navigation";

import Button from "@components/button/button";

import { Category, Settings, Tongue, TonguePair } from "@models";

import TongueSelector from "./components/tongueselector/tongueselector";
import styles from "./vocab.module.css";
import { FlatCategory } from "src/app/lib/category-tree";
import { getSettings, setSettings } from "src/db/helpers/settings";

async function pickTongue(tongueId: number): Promise<TonguePair> {
    "use server";

    const settings = await getSettings();
    const nativeTongueId = settings.nativeTongueId;

    const [newTonguePair] = await TonguePair.findOrCreate({
        where: {
            nativeTongueId: nativeTongueId,
            studyingTongueId: tongueId,
        },
    });

    setSettings({ tonguePair: newTonguePair });
    return newTonguePair;
}

async function getTonguePairSheetsAsJson(
    tonguePair: TonguePair,
): Promise<
    { sheetId: number; sheetName: string; categoryId: number | null }[]
> {
    const sheets = [];
    for (const sheet of await tonguePair.getSheets()) {
        sheets.push({
            sheetId: sheet.id,
            sheetName: sheet.sheetName,
            categoryId: sheet.categoryId,
        });
    }
    return sheets;
}

async function getTonguePairCategoriesAsJson(
    tonguePair: TonguePair,
): Promise<FlatCategory[]> {
    const categories = await Category.findAll({
        where: { tonguePairId: tonguePair.id },
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

async function pickTongueAndGetBack(tongueId: number): Promise<{
    id: number;
    tongueName: string;
    flag: string;
    sheets: { sheetId: number; sheetName: string; categoryId: number | null }[];
    categories: FlatCategory[];
}> {
    "use server";

    const tonguePair = await pickTongue(tongueId);
    const studyingTongue = await tonguePair.studyingTongue();
    const sheets = await getTonguePairSheetsAsJson(tonguePair);
    const categories = await getTonguePairCategoriesAsJson(tonguePair);
    return {
        id: studyingTongue.id,
        tongueName: studyingTongue.tongueName,
        flag: studyingTongue.flag,
        sheets,
        categories,
    };
}

async function fetchAllTongues(): Promise<
    { id: number; tongueName: string; flag: string }[]
> {
    "use server";
    const allTongues = await Tongue.findAll({
        attributes: ["id", "tongueName", "flag"],
    });
    const tongueJSON = [];
    for (const tongue of allTongues) {
        tongueJSON.push(tongue.toJSON());
    }

    return tongueJSON;
}

export default async function Home() {
    let allTongues: { id: number; tongueName: string; flag: string }[];
    let settings: Settings;
    let tonguePair: TonguePair;
    let sheets: {
        sheetId: number;
        sheetName: string;
        categoryId: number | null;
    }[];
    let categories: FlatCategory[];
    try {
        allTongues = await fetchAllTongues();
        settings = await getSettings();
        tonguePair = settings.tonguePair;
        sheets = tonguePair ? await getTonguePairSheetsAsJson(tonguePair) : [];
        categories = tonguePair
            ? await getTonguePairCategoriesAsJson(tonguePair)
            : [];
    } catch (error) {
        console.error("Vocab page error:", error);
        return notFound();
    }
    const initialTongueModel = tonguePair ? tonguePair.studying : null;
    const initialTongue = initialTongueModel
        ? {
              id: initialTongueModel.id,
              tongueName: initialTongueModel.tongueName,
              flag: initialTongueModel.flag,
              sheets,
              categories,
          }
        : null;

    return (
        <div className={styles.centre}>
            <TongueSelector
                onChangeTongue={pickTongueAndGetBack}
                allTongues={allTongues}
                initialTongue={initialTongue}
            ></TongueSelector>
            <Button href="/">Back</Button>
        </div>
    );
}

export const dynamic = "force-dynamic";
