import clsx from "clsx";
import { useContext } from "react";

import testSheetContext from "../../context";
import Star from "../star/star";
import styles from "./test-results.module.css";

export default function TestResults() {
    const {
        numberCorrect,
        numberIncorrect,
        startingNumberOfStars,
        numberOfStars,
    } = useContext(testSheetContext);
    const totalQuestions = numberCorrect + numberIncorrect;

    const changeStars = numberOfStars - startingNumberOfStars;
    let changeStarsText = `+${changeStars}`;
    if (changeStars < 0) {
        changeStarsText = `-${-changeStars}`;
    }
    const changeStarsStyle = clsx(styles.numberofstars, {
        [styles.gainstars]: changeStars > 0,
        [styles.losestars]: changeStars < 0,
    });

    return (
        <>
            <div className={styles.starpadding}>
                <div className={styles.starinfo}>
                    <div className={styles.starslabel}>Stars before</div>
                    <div>
                        <span className={styles.numberofstars}>
                            {startingNumberOfStars}
                        </span>
                        <Star></Star>
                    </div>
                </div>
                <div className={styles.starinfo}>
                    <div className={styles.starslabel}>Stars after</div>
                    <div>
                        <span className={styles.numberofstars}>
                            {numberOfStars}
                        </span>
                        <Star></Star>
                    </div>
                </div>
                <div>
                    <span className={changeStarsStyle}>{changeStarsText}</span>
                    <Star></Star>
                </div>
            </div>
            <div>
                You answered {numberCorrect}/{totalQuestions} questions
                correctly!
            </div>
        </>
    );
}
