import { useContext } from "react";

import testSheetContext from "../../context";

export default function TestResults() {
    const {
        numberCorrect,
        numberIncorrect,
        startingNumberOfStars,
        numberOfStars,
    } = useContext(testSheetContext);
    const totalQuestions = numberCorrect + numberIncorrect;
    return (
        <>
            <div>
                You answered {numberCorrect}/{totalQuestions} questions
                correctly!
            </div>
            <div>
                You had {startingNumberOfStars} stars, but now you have{" "}
                {numberOfStars} stars!
            </div>
        </>
    );
}
