import Head from 'next/head';
import Link from 'next/link';
import { Music, Home, ArrowLeft } from 'lucide-react';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found — Spotify Clone</title>
      </Head>

      <div className="min-h-screen bg-spotify-black flex flex-col items-center justify-center px-4 text-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <img src="/general/logo.svg" className="w-10 h-10 shrink-0" alt="Spotify Logo" />
          <span className="text-2xl font-bold text-white tracking-tight">
            Spotify
          </span>
        </div>

        {/* Illustration */}
        <div className="relative mb-8">
          <div className="text-[120px] md:text-[180px] font-black text-white/5 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-spotify-card flex items-center justify-center animate-bounce-subtle">
              <Music className="w-10 h-10 text-spotify-muted" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          Page not found
        </h1>
        <p className="text-spotify-muted mb-8 max-w-md">
          We can&apos;t seem to find the page you&apos;re looking for. It might
          have been removed, or you may have mistyped the URL.
        </p>

        <div className="flex items-center gap-4">
          <Link href="/home" className="btn-spotify text-sm py-2.5 px-6 flex items-center gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-outline text-sm py-2.5 px-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </>
  );
}
