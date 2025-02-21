import { useContext } from "react";

import { InflectionType } from "@models";

import editSheetContext from "../../context";

interface PickInflectionsProps {
    inflectionType: InflectionType;
}

export default function PickInflections({
    inflectionType,
}: PickInflectionsProps) {
    const { setProposedInflectionType } = useContext(editSheetContext);

    const onClick = () => {
        setProposedInflectionType(inflectionType);
    };

    return <div onClick={onClick}>{inflectionType.typeName}</div>;
}
