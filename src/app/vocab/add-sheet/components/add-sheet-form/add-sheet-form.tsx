"use client";

import { useRouter } from "next/navigation";
import { NextResponse } from "next/server";
import { useState } from "react";

import { AddSheetRequestAPI, AddSheetResponseAPI } from "../../add-sheet/api";
import SheetNameInput from "../sheet-name-input/sheet-name-input";

interface AddSheetFormProps {
    validateSheetName: (sheetName: string) => Promise<boolean>;
}

export default function AddSheetForm({ validateSheetName }: AddSheetFormProps) {
    const [pending, setPending] = useState<boolean>(false);
    const router = useRouter();

    async function addSheetHandleResponse(response: NextResponse) {
        if (!response.ok) {
            console.error("Failed to create sheet!");
            setPending(false);
        }

        const responseJSON: AddSheetResponseAPI = await response.json();
        router.push(`/vocab/${responseJSON.sheetId}`);
    }

    function addSheet(formData: FormData) {
        setPending(true);
        const proposedName = formData.get("sheet-name") as string;
        const body: AddSheetRequestAPI = { proposedName };
        fetch("/vocab/add-sheet/add-sheet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).then(addSheetHandleResponse);
    }

    return (
        <form action={addSheet}>
            <SheetNameInput
                onChange={validateSheetName}
                pending={pending}
            ></SheetNameInput>
        </form>
    );
}
