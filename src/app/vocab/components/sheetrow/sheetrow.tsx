import { useRouter } from "next/navigation";

import styles from "./sheetrow.module.css";

interface SheetRowProps {
    children: React.ReactNode;
    href?: string;
}

export default function SheetRow({ children, href }: SheetRowProps) {
    const goToSheet = () => {
        router.push(href);
    };
    const router = useRouter();

    return (
        <tr className={styles.sheetrow}>
            <td className={styles.paddedcell} onClick={goToSheet}>
                {children}
            </td>
        </tr>
    );
}
