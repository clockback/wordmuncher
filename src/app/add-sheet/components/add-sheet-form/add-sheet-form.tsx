"use client";

import { useRouter } from "next/navigation";
import { NextResponse } from "next/server";
import { useState } from "react";

import SheetNameInput from "../sheet-name-input/sheet-name-input";

interface AddSheetFormProps {
    validateSheetName: (sheetName: string) => Promise<boolean>;
}

export default function AddSheetForm({ validateSheetName }: AddSheetFormProps) {
    const [pending, setPending] = useState(false);
    const router = useRouter();

    function addSheetHandleResponse(response: NextResponse) {
        response.json().then((contents) => {
            if (contents.success) {
                router.push("/vocab");
            } else {
                console.log("Failed to create sheet!");
                setPending(false);
            }
        });
    }

    function addSheet(formData: FormData) {
        setPending(true);
        const proposedName = formData.get("sheet-name") as string;
        fetch("/add-sheet/add-sheet", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                proposedName: proposedName,
            }),
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
