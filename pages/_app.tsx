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
        <title>알아들었으면 끄덕여</title>
        <meta name="title" content="알아들었으면 끄덕여" />
        <meta name="description" content="알아들었으면 끄덕여?" />
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
