import styles from "./Home.module.css";

export default function Home() {
    return (
        <div className={styles.vertical}>
            <div className={styles.buttonpadding}>
                <a className={styles.centre}>Learn</a>
            </div>
            <div className={styles.buttonpadding}>
                <a href="/vocab" className={styles.centre}>
                    Vocab
                </a>
            </div>
        </div>
    );
}
