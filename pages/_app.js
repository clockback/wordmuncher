import "../styles/global.css";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function MyApp({ Component, pageProps }) {
    return (
        <main className={spaceGrotesk.className}>
            <Component {...pageProps} />
        </main>
    );
}
