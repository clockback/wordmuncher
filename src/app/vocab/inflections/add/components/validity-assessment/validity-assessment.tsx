import { InflectionValidity } from "../../helpers/helpers";
import styles from "./validity-assessment.module.css";

interface ValidityAssessmentProps {
    isValid: InflectionValidity;
}

export default function ValidityAssessment({
    isValid,
}: ValidityAssessmentProps) {
    switch (isValid) {
        case InflectionValidity.InflectionNotNamed:
            return (
                <h2 className={styles.invalid}>
                    Invalid: Inflection not named
                </h2>
            );
        case InflectionValidity.CategoryNotNamed:
            return (
                <h2 className={styles.invalid}>
                    Invalid: Missing category name
                </h2>
            );
        case InflectionValidity.MatchingCategoryNames:
            return (
                <h2 className={styles.invalid}>
                    Invalid: Missing category name
                </h2>
            );
        case InflectionValidity.MissingFeatures:
            return (
                <h2 className={styles.invalid}>Invalid: Missing features</h2>
            );
        case InflectionValidity.Valid:
            return <h2 className={styles.valid}>Valid inflection table</h2>;
        default:
            console.error(`Unknown inflection validity provided. ${isValid}`);
            return null;
    }
}
