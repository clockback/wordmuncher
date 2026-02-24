"use client";

import { useRouter } from "next/navigation";
import { NextResponse } from "next/server";
import { useState } from "react";

import { AddTongueRequestAPI } from "../../add-tongue/api";
import TongueNameInput from "../tongue-name-input/tongue-name-input";

interface AddTongueFormProps {
    validateTongueName: (tongueName: string) => Promise<boolean>;
    applyAs?: "native" | "studying";
}

export default function AddTongueForm({
    validateTongueName,
    applyAs,
}: AddTongueFormProps) {
    const [pending, setPending] = useState<boolean>(false);
    const router = useRouter();

    const redirectTo = applyAs === "studying" ? "/vocab" : "/settings";

    async function addTongueHandleResponse(response: NextResponse) {
        if (!response.ok) {
            console.error("Failed to create tongue!");
            setPending(false);
            return;
        }

        router.push(redirectTo);
    }

    function addTongue(formData: FormData) {
        setPending(true);
        const proposedName = formData.get("tongue-name") as string;
        const flag = formData.get("flag") as string;
        const body: AddTongueRequestAPI = { proposedName, flag, applyAs };
        fetch("/settings/add-tongue/add-tongue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).then(addTongueHandleResponse);
    }

    return (
        <form action={addTongue}>
            <TongueNameInput
                onChange={validateTongueName}
                pending={pending}
            ></TongueNameInput>
        </form>
    );
}
