import { JSX, useContext } from "react";

import editSheetContext from "../../context";
import PickInflections from "../pick-inflections/pick-inflections";
import PickNoInflections from "../pick-no-inflections/pick-no-inflections";
import styles from "./inflection-picker.module.css";

export default function InflectionPicker() {
    const { inflectionTypes, proposedInflectionType } =
        useContext(editSheetContext);

    const options = [];
    let selectedInflectionDiv: JSX.Element;

    if (proposedInflectionType === null) {
        selectedInflectionDiv = <PickNoInflections></PickNoInflections>;
    } else {
        selectedInflectionDiv = (
            <PickInflections
                inflectionType={proposedInflectionType}
            ></PickInflections>
        );
        options.push(<PickNoInflections key={-1}></PickNoInflections>);
    }

    for (const inflectionType of inflectionTypes) {
        if (
            proposedInflectionType !== null &&
            inflectionType.id === proposedInflectionType.id
        ) {
            continue;
        }
        options.push(
            <PickInflections
                key={inflectionType.id}
                inflectionType={inflectionType}
            ></PickInflections>,
        );
    }

    return (
        <div className={styles.inflectionpicker}>
            {selectedInflectionDiv}
            <div className={styles.options}>{options}</div>
        </div>
    );
}
