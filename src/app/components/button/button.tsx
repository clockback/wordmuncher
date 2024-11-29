import styles from "./button.module.css";

interface ButtonProps {
    children: React.ReactNode;
    href?: string | null;
}

export default function Button({ children, href }: ButtonProps) {
    if (href === null || href === undefined) {
        return <button className={styles.centre}>{children}</button>;
    } else {
        return (
            <a className={styles.centre} href={href}>
                {children}
            </a>
        );
    }
}
