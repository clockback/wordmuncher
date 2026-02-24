import { Tongue } from "@models";

import styles from "./add-tongue.module.css";
import AddTongueForm from "./components/add-tongue-form/add-tongue-form";

async function validateTongueName(tongueName: string): Promise<boolean> {
    "use server";

    const tongue = await Tongue.findOne({
        where: { tongueName: tongueName },
    });

    return tongue !== null;
}

interface PageProps {
    searchParams: Promise<{ for?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    const applyAs =
        params.for === "native" || params.for === "studying"
            ? params.for
            : undefined;

    return (
        <div className={styles.centrecontent}>
            <div className={styles.centreheader}>Add a new language...</div>
            <AddTongueForm
                validateTongueName={validateTongueName}
                applyAs={applyAs}
            />
        </div>
    );
}

export const dynamic = "force-dynamic";
