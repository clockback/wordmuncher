import styles from "./sheetrow.module.css";

export default function SheetRow({ children }) {
    return (
        <tr className={styles.sheetrow}>
            <td className={styles.paddedcell}>{children}</td>
        </tr>
    );
}
