import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Always redirect to home — guest browsing is allowed
    router.replace('/home');
  }, [router]);

  return (
    <>
      <Head>
        <title>Spotify Clone — Music Streaming Platform</title>
      </Head>
      <div className="flex h-screen items-center justify-center bg-spotify-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-spotify-green border-t-transparent" />
      </div>
    </>
  );
}
