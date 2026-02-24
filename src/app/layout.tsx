import { Space_Grotesk } from "next/font/google";
import Link from "next/link";

import styles from "./app.module.css";
import "./global.css";
import Logo from "src/app/assets/images/logo.svg";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata = {
    title: "Word Muncher",
    description: "A vocabulary-memorization tool.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={spaceGrotesk.className}>
                <div className={styles.container}>
                    <div className={styles.sidebar}>
                        <div>
                            <Link href="/">
                                <Logo
                                    className={styles.padded}
                                    alt="Word Muncher"
                                    width="100%"
                                />
                            </Link>
                            <div className={styles.sidebarLink}>
                                <Link
                                    className={styles.inline}
                                    href="/settings"
                                >
                                    Settings
                                </Link>
                            </div>
                            <a
                                className={styles.inline}
                                href="https://github.com/clockback/wordmuncher"
                            >
                                Contributions welcome!
                            </a>
                        </div>
                    </div>

                    <div className={styles.mainpage}>{children}</div>
                </div>
            </body>
        </html>
    );
}
