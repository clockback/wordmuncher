import styles from "#root/styles/Home.module.css";

export default function Home() {
    return (
        <div className={styles.vertical}>
            <div className={styles.buttonpadding}>
                <button className={styles.centre}>Learn</button>
            </div>
            <div className={styles.buttonpadding}>
                <button className={styles.centre}>Vocab</button>
            </div>
        </div>
    );
}
