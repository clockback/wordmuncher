import { JSX, useContext } from "react";

import InflectionTemplate from "@components/inflection-template/inflection-template";

import testSheetContext from "../../context";
import InflectionAnswerEntry from "../inflection-answer-entry/inflection-answer-entry";

export default function AnswerSectionInflectionTable() {
    const { question, inflectionAnswers } = useContext(testSheetContext);

    const cellContents = new Map<string, () => JSX.Element>();
    for (const featureKey of inflectionAnswers.keys()) {
        cellContents.set(featureKey, () => (
            <InflectionAnswerEntry
                featureKey={featureKey}
            ></InflectionAnswerEntry>
        ));
    }

    return (
        <InflectionTemplate
            inflectionType={question.inflectionType}
            cellContents={cellContents}
        ></InflectionTemplate>
    );
}
