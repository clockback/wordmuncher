import styles from "#root/styles/Home.module.css";

export default function Home() {
    return (
        <div className={styles.centre}>
            <h1>You are studying French!</h1>
            <button className={styles.centre}>Change language</button>
        </div>
    );
}
