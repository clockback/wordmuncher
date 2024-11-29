import styles from "./button.module.css";

interface ButtonProps {
    children: React.ReactNode;
    href?: string | null;
    onClick?: () => void;
}

export default function Button({ children, href, onClick }: ButtonProps) {
    if (href === null || href === undefined) {
        return (
            <button className={styles.centre} onClick={onClick}>
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
