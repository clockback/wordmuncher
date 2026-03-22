"use client";

import { useRouter } from "next/navigation";

import styles from "./sheetrow.module.css";

interface SheetRowProps {
    children: React.ReactNode;
    href?: string;
    depth?: number;
    onMove?: () => void;
}

export default function SheetRow({
    children,
    href,
    depth = 0,
    onMove,
}: SheetRowProps) {
    const router = useRouter();

    const goToSheet = () => {
        router.push(href);
    };

    const indentPx = depth * 20;

    return (
        <tr className={styles.sheetrow}>
            <td
                title={`Edit ${children.toString()}`}
                className={styles.paddedcell}
                style={{ paddingLeft: `${indentPx + 10}px` }}
                onClick={goToSheet}
            >
                {onMove && (
                    <span className={styles.actions}>
                        <button
                            className={styles.actionButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                onMove();
                            }}
                            title="Move to category"
                        >
                            ↕
                        </button>
                    </span>
                )}
                {children}
            </td>
        </tr>
    );
}
