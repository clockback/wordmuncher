import { useContext } from "react";

import testSheetContext from "../../context";

export default function TestResults() {
    const { numberCorrect, numberIncorrect } = useContext(testSheetContext);
    const totalQuestions = numberCorrect + numberIncorrect;
    return (
        <div>
            You answered {numberCorrect}/{totalQuestions} questions correctly!
        </div>
    );
}
