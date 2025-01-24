"use client";

import styles from "./mini-button.module.css";

interface MiniButtonProps {
    children: React.ReactNode;
    href?: string | null;
    onClick?: () => void;
    type?: "submit" | "button" | "reset";
    disabled?: boolean;
}

export default function MiniButton({
    children,
    href,
    onClick,
    type,
    disabled,
}: MiniButtonProps) {
    if (href === null || href === undefined) {
        return (
            <button
                className={styles.centre}
                onClick={onClick}
                type={type}
                disabled={disabled}
            >
                {children}
            </button>
        );
    } else {
        return (
            <a className={styles.centre} href={href}>
                {children}
            </a>
        );
    }
}
