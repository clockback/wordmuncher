import styles from "./edit-sheet-header.module.css";

export default function EditSheetHeader({ children }) {
    return (
        <div className={styles.header}>
            <h1 className={styles.centre}>{children}</h1>
        </div>
    );
}
