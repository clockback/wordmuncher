import { useContext } from "react";

import editSheetContext from "../../context";

export default function PickNoInflections() {
    const { setProposedInflectionType } = useContext(editSheetContext);

    const onClick = () => {
        setProposedInflectionType(null);
    };

    return <div onClick={onClick}>No inflections</div>;
}
