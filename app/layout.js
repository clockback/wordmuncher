import "#root/styles/global.css";
import styles from "#root/styles/Home.module.css";

import { Space_Grotesk } from "next/font/google";

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
                            <h1 className={styles.title}>Word Muncher</h1>
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
