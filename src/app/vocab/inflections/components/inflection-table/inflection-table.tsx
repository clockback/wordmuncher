"use client";

import { redirect } from "next/navigation";

import { InflectionType } from "@models";

interface InflectionTableProps {
    inflectionType: InflectionType;
}

export default function InflectionTable({
    inflectionType,
}: InflectionTableProps) {
    function clickRow() {
        redirect(`/vocab/inflections/modify/${inflectionType.id}`);
    }

    return <td onClick={clickRow}>{inflectionType.typeName}</td>;
}
