import styles from "./flag.module.css";

interface FlagProps {
    flag: string;
}

export default function Flag({ flag }: FlagProps) {
    return <div className={styles.learningflag}>{flag}</div>;
}
