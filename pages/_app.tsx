import "../styles/globals.css";
import "@fontsource/poppins";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";

import type { AppProps } from "next/app";
import { Auth } from "../components/menu/Auth";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>이해했니?</title>
        <meta name="title" content="이해했니?" />
        <meta name="description" content="이해했니?" />
        <link rel="icon" href="/screaming.png" />
      </Head>

      <div className="min-w-screen min-h-screen bg-neutral-100 font-main font-thin text-neutral-800">
        <Auth>
          <div>
            <Component {...pageProps} />
          </div>
        </Auth>
      </div>
    </>
  );
}
