import { notFound } from "next/navigation";
import { col } from "sequelize";

import Button from "@components/button/button";

import { InflectionCategory, InflectionFeature, InflectionType } from "@models";

import InflectionTemplate from "./components/inflection-template/inflection-template";
import styles from "./inflection-type.module.css";

export default async function ModifyInflectionType({
    params,
}: {
    params: Promise<{ "inflection-type": number }>;
}) {
    const loadParams = await params;
    if (loadParams === undefined) {
        return notFound();
    }

    const inflectionType = await InflectionType.findByPk(
        loadParams["inflection-type"],
        {
            include: {
                model: InflectionCategory,
                as: "categories",
                include: [
                    {
                        model: InflectionFeature,
                        as: "features",
                        order: col("orderInCategory"),
                    },
                ],
            },
        },
    );
    if (inflectionType === null) {
        return notFound();
    }

    return (
        <>
            <div className={styles.leftmargin}>
                <h1>{inflectionType.typeName}</h1>
            </div>
            <div style={{ textAlign: "center" }}>
                <h2>Display</h2>
                <InflectionTemplate
                    inflectionType={inflectionType}
                ></InflectionTemplate>
                <div className={styles.buttonmargin}>
                    <Button href="/vocab/inflections">Back</Button>
                </div>
            </div>
        </>
    );
}
