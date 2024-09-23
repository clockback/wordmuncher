import styles from "#root/styles/Home.module.css";

export default function Home() {
    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div>
                    <h1 className={styles.title}>Word Muncher</h1>
                    <a
                        className={styles.inline}
                        href="https://github.com/clockback/wordmuncher"
                    >
                        Contributions welcome!
                    </a>
                </div>
            </div>

            <div className={styles.mainpage}>
                <div className={styles.vertical}>
                    <div className={styles.buttonpadding}>
                        <button className={styles.centre}>Learn</button>
                    </div>
                    <div className={styles.buttonpadding}>
                        <button className={styles.centre}>Vocab</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
