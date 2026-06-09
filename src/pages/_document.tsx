import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="Spotify Clone — Music Streaming Platform" />
        <meta name="theme-color" content="#121212" />
        <link rel="icon" href="/general/logo.svg" type="image/svg+xml" />
      </Head>
      <body className="bg-spotify-black">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
