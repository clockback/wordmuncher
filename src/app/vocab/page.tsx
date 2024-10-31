import styles from "src/app/Home.module.css";

export default async function Home() {
    return (
        <div className={styles.centre}>
            <h1>You are studying French!</h1>
            <button className={styles.centre}>Change language</button>
        </div>
    );
}
