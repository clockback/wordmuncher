import styles from "./vocab.module.css";
import Button from "@components/button/button";

export default async function Home() {
    return (
        <div className={styles.centre}>
            <h1>You are studying French!</h1>
            <Button>Change language</Button>
        </div>
    );
}
