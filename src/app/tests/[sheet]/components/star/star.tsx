import StarSVG from "../../assets/images/star.svg";
import styles from "./star.module.css";

export default function Star() {
    return (
        <div className={styles.star}>
            <StarSVG></StarSVG>
        </div>
    );
}
