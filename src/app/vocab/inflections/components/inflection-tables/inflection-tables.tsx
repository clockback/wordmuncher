import styles from "./inflection-tables.module.css";

export default function InflectionTables({ children }) {
    return (
        <div className={styles.margintable}>
            <table className={styles.inlinetable}>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}
