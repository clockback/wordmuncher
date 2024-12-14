import styles from "./edit-sheet-header.module.css";

export default function EditSheetHeader({ children }) {
    return (
        <div className={styles.header}>
            <div className={styles.centre}>{children}</div>
        </div>
    );
}
