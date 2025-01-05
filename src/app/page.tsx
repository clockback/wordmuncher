import Button from "@components/button/button";

import styles from "./app.module.css";

export default function Home() {
    return (
        <div className={styles.vertical}>
            <div className={styles.buttonpadding}>
                <Button href="/tests">Learn</Button>
            </div>
            <div className={styles.buttonpadding}>
                <Button href="/vocab">Vocab</Button>
            </div>
        </div>
    );
}
