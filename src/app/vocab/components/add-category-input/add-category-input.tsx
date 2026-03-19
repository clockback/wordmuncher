"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./add-category-input.module.css";

interface AddCategoryInputProps {
    parentCategoryId: number | null;
    depth: number;
    onSubmit: (name: string, parentId: number | null) => Promise<void>;
    onCancel: () => void;
}

export default function AddCategoryInput({
    parentCategoryId,
    depth,
    onSubmit,
    onCancel,
}: AddCategoryInputProps) {
    const [value, setValue] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onCancel();
        } else if (e.key === "Enter") {
            await submit();
        }
    };

    const submit = async () => {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            onCancel();
            return;
        }
        setPending(true);
        setError(null);
        try {
            await onSubmit(trimmed, parentCategoryId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create");
            setPending(false);
        }
    };

    const indentPx = depth * 20;

    return (
        <tr className={styles.inputRow}>
            <td
                className={styles.inputCell}
                style={{ paddingLeft: `${indentPx + 10}px` }}
                colSpan={2}
            >
                <input
                    ref={inputRef}
                    className={styles.input}
                    type="text"
                    placeholder="Category name"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={submit}
                    disabled={pending}
                />
                {error ? (
                    <span className={styles.warning}>{error}</span>
                ) : (
                    <span className={styles.hint}>
                        Enter to save, Esc to cancel
                    </span>
                )}
            </td>
        </tr>
    );
}
