import { notFound } from "next/navigation";
import { JSX } from "react";

import Button from "@components/button/button";

import { InflectionType } from "@models";

import InflectionTable from "./components/inflection-table/inflection-table";
import InflectionTables from "./components/inflection-tables/inflection-tables";
import styles from "./inflection.module.css";
import { getSettings } from "src/db/helpers/settings";

async function fetchInflectionTypes(): Promise<InflectionType[]> {
    const settings = await getSettings();
    const tonguePairId = settings.tonguePairId;
    return await InflectionType.findAll({ where: { tonguePairId } });
}

async function inflectionTypesAsTable(): Promise<JSX.Element[]> {
    const inflectionTypes = await fetchInflectionTypes();
    const allRows = [];

    for (const inflectionType of inflectionTypes) {
        allRows.push(
            <tr key={inflectionType.id}>
                <InflectionTable
                    inflectionType={inflectionType.toJSON()}
                ></InflectionTable>
            </tr>,
        );
    }

    return allRows;
}

export default async function Inflections() {
    let rows: JSX.Element[];
    try {
        rows = await inflectionTypesAsTable();
    } catch {
        return notFound();
    }

    return (
        <div className={styles.centre}>
            <div className={styles.verticalcentre}>
                <h1>Inflections</h1>
                <InflectionTables>{rows}</InflectionTables>
                <div className={styles.padbutton}>
                    <Button href="/vocab/inflections/add">
                        Add inflection table
                    </Button>
                </div>
                <div className={styles.padbutton}>
                    <Button href="/vocab">Back</Button>
                </div>
            </div>
        </div>
    );
}

export const dynamic = "force-dynamic";
