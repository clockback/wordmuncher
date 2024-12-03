import styles from "./sheetslist.module.css";
import SheetRow from "../sheetrow/sheetrow";

interface SheetsListProps {
    sheets: { sheetId: number; sheetName: string }[];
}

export default function SheetsList({ sheets }: SheetsListProps) {
    if (sheets.length == 0) {
        return null;
    }
    const sheetElements = [];
    for (let sheet of sheets) {
        sheetElements.push(
            <SheetRow key={sheet.sheetId}>{sheet.sheetName}</SheetRow>,
        );
    }
    return (
        <div tabIndex={-1} className={styles.tablecontainer}>
            <table className={styles.inlinetable}>
                <tbody>{sheetElements}</tbody>
            </table>
        </div>
    );
}
