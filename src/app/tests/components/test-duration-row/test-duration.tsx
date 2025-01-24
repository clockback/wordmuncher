import { redirect } from "next/navigation";

import MiniButton from "@components/mini-button/mini-button";

import styles from "./test-duration.module.css";

interface TestDurationRowProps {
    sheetId: number;
}

export default function TestDurationRow({ sheetId }: TestDurationRowProps) {
    const generateLink = (noQuestions: number | null = null) => {
        let params: URLSearchParams;
        if (noQuestions === null) {
            params = new URLSearchParams({ questions: "all" });
        } else {
            params = new URLSearchParams({ questions: noQuestions.toString() });
        }
        return () => redirect(`/tests/${sheetId}?${params.toString()}`);
    };

    return (
        <tr>
            <td colSpan={2}>
                <div className={styles.padcell}>
                    <MiniButton onClick={generateLink(5)}>
                        5 questions
                    </MiniButton>
                    <MiniButton onClick={generateLink(20)}>
                        20 questions
                    </MiniButton>
                    <MiniButton onClick={generateLink(50)}>
                        50 questions
                    </MiniButton>
                    <MiniButton onClick={generateLink()}>
                        All questions
                    </MiniButton>
                </div>
            </td>
        </tr>
    );
}
