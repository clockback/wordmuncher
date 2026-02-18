import { useContext } from "react";

import editSheetContext from "../../context";
import styles from "./create-inverted-entry.module.css";

export default function CreateInvertedEntry() {
    const {
        createInvertedEntry,
        isAddingNewQuestion,
        proposedInflectionType,
        setCreateInvertedEntry,
    } = useContext(editSheetContext);

    if (!isAddingNewQuestion || proposedInflectionType !== null) {
        return null;
    }

    return (
        <label className={styles.invertedentry}>
            <input
                type="checkbox"
                checked={createInvertedEntry}
                onChange={(e) => setCreateInvertedEntry(e.target.checked)}
            />
            Create inverted entry
        </label>
    );
}
