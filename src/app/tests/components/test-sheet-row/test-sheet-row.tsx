"use client";

import { useRouter } from "next/navigation";

interface TestSheetRowProps {
    sheet: {
        id: number;
        sheetName: string;
        progress: number;
    };
}

export default function TestSheetRow({ sheet }: TestSheetRowProps) {
    const router = useRouter();

    const clickSheet = () => {
        router.push(`/tests/${sheet.id}`);
    };

    return (
        <tr onClick={clickSheet}>
            <td>{sheet.sheetName}</td>
            <td>{sheet.progress * 100}%</td>
        </tr>
    );
}
