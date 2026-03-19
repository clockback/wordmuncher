"use client";

import clsx from "clsx";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";

import styles from "./category-row.module.css";
import categoryTreeContext from "./category-tree-context";

interface CategoryRowProps {
    categoryId: number;
    categoryName: string;
    depth: number;
    hasChildren: boolean;
    children?: ReactNode;
    renderActions?: () => ReactNode;
    isRenaming?: boolean;
    onRenameSubmit?: (newName: string) => Promise<void>;
    onRenameCancel?: () => void;
    forceExpanded?: boolean;
    colSpan?: number;
}

export default function CategoryRow({
    categoryId,
    categoryName,
    depth,
    hasChildren,
    children,
    renderActions,
    isRenaming,
    onRenameSubmit,
    onRenameCancel,
    forceExpanded,
    colSpan,
}: CategoryRowProps) {
    const context = useContext(categoryTreeContext);
    if (!context) {
        throw new Error("CategoryRow must be used within CategoryTreeProvider");
    }

    const { expandedCategoryIds, toggleCategory } = context;
    const isExpanded = expandedCategoryIds.has(categoryId) || forceExpanded;

    const handleClick = () => {
        if (hasChildren && !isRenaming) {
            toggleCategory(categoryId);
        }
    };

    const chevron = hasChildren ? "▶" : "·";
    const indentPx = depth * 20;

    return (
        <>
            <tr
                className={clsx(styles.categoryRow, {
                    [styles.expanded]: isExpanded,
                })}
                onClick={handleClick}
            >
                <td
                    style={{ paddingLeft: `${indentPx + 10}px` }}
                    colSpan={colSpan}
                >
                    <div className={styles.categoryCell}>
                        <span className={styles.chevron}>{chevron}</span>
                        {isRenaming ? (
                            <RenameInput
                                currentName={categoryName}
                                onSubmit={onRenameSubmit!}
                                onCancel={onRenameCancel!}
                            />
                        ) : (
                            <span className={styles.categoryName}>
                                {categoryName}
                            </span>
                        )}
                        {renderActions && (
                            <span className={styles.actions}>
                                {renderActions()}
                            </span>
                        )}
                    </div>
                </td>
            </tr>
            {isExpanded && children}
        </>
    );
}

interface RenameInputProps {
    currentName: string;
    onSubmit: (newName: string) => Promise<void>;
    onCancel: () => void;
}

function RenameInput({ currentName, onSubmit, onCancel }: RenameInputProps) {
    const [value, setValue] = useState(currentName);
    const [pending, setPending] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const submit = async () => {
        const trimmed = value.trim();
        if (trimmed.length === 0 || trimmed === currentName) {
            onCancel();
            return;
        }
        setPending(true);
        try {
            await onSubmit(trimmed);
        } catch {
            setPending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === "Escape") {
            onCancel();
        } else if (e.key === "Enter") {
            submit();
        }
    };

    return (
        <input
            ref={inputRef}
            className={styles.renameInput}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={submit}
            onClick={(e) => e.stopPropagation()}
            disabled={pending}
        />
    );
}
