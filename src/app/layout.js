import "./global.css";
import styles from "./Home.module.css";
import Logo from "#root/src/app/assets/images/logo.svg";

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
                            <a href="/">
                                <Logo
                                    className={styles.padded}
                                    alt="Word Muncher"
                                    width="100%"
                                />
                            </a>
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
