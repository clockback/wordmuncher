"use client";

import styles from "./button.module.css";

interface ButtonProps {
    children: React.ReactNode;
    href?: string | null;
    onClick?: () => void;
    type?: "submit" | "button" | "reset";
    disabled?: boolean;
}

export default function Button({
    children,
    href,
    onClick,
    type,
    disabled,
}: ButtonProps) {
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
