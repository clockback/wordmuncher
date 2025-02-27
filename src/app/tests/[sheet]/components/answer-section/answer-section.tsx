import { useContext } from "react";

import testSheetContext from "../../context";
import AnswerSectionInflectionTable from "../answer-section-inflection-table/answer-section-inflection-table";
import AnswerSectionText from "../answer-section-text/answer-section-text";

export default function AnswerSection() {
    const { question } = useContext(testSheetContext);

    if (question.inflectionTypeId === null) {
        return <AnswerSectionText></AnswerSectionText>;
    } else {
        return <AnswerSectionInflectionTable></AnswerSectionInflectionTable>;
    }
}
