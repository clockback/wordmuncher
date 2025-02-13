import styles from "./add-inflection.module.css";
import AddInflectionArea from "./components/add-inflection-area/add-inflection-area";

export default async function AddInflectionType() {
    return (
        <div className={styles.pad}>
            <AddInflectionArea></AddInflectionArea>
        </div>
    );
}
