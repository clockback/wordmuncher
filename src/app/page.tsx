import styles from "./app.module.css";
import Button from "@components/button/button";

export default function Home() {
    return (
        <div className={styles.vertical}>
            <div className={styles.buttonpadding}>
                <Button>Learn</Button>
            </div>
            <div className={styles.buttonpadding}>
                <Button href="/vocab">Vocab</Button>
            </div>
        </div>
    );
}
