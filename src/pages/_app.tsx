import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import '@/styles/globals.css';
import MainLayout from '@/components/layout/MainLayout';
import ArtistLayout from '@/components/layout/ArtistLayout';
import { useAuthStore } from '@/stores/useAuthStore';
import { useArtistStore } from '@/stores/useArtistStore';
import ToastContainer from '@/components/ui/Toast';

// Pages that don't use any layout (full-screen auth pages)
const noLayoutPages = ['/login', '/register', '/artist/login', '/', '/404', '/500'];

// Pages that use the artist portal layout
const artistPortalPages = [
  '/artist/dashboard',
  '/artist/songs',
  '/artist/albums',
  '/artist/analytics',
  '/artist/gallery',
  '/artist/profile',
  '/artist/concerts',
];

function isArtistPortalPage(pathname: string): boolean {
  return artistPortalPages.some((p) => pathname.startsWith(p));
}

function isNoLayoutPage(pathname: string): boolean {
  return noLayoutPages.includes(pathname);
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { pathname } = router;
  const checkSessionExpiry = useAuthStore((s) => s.checkSessionExpiry);
  const checkArtistSessionExpiry = useArtistStore((s) => s.checkSessionExpiry);

  // Check session expiry on every route change
  useEffect(() => {
    checkSessionExpiry();
    checkArtistSessionExpiry();
  }, [pathname, checkSessionExpiry, checkArtistSessionExpiry]);

  // No layout for auth pages and landing
  if (isNoLayoutPage(pathname)) {
    return (
      <>
        <Component {...pageProps} />
        <ToastContainer />
      </>
    );
  }

  // Artist portal layout
  if (isArtistPortalPage(pathname)) {
    return (
      <>
        <ArtistLayout>
          <Component {...pageProps} />
        </ArtistLayout>
        <ToastContainer />
      </>
    );
  }

  // Default: Main user layout (sidebar + player bar)
  return (
    <>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
      <ToastContainer />
    </>
  );
}
