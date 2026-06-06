import { useEffect, type ComponentType } from 'react';
import { useRouter } from 'next/router';
import { useArtistStore } from '@/stores/useArtistStore';

/**
 * Higher Order Component to protect artist portal routes.
 * Redirects to /artist/login if not authenticated as artist.
 */
export function withArtistAuth<P extends object>(Component: ComponentType<P>) {
  return function ProtectedArtistPage(props: P) {
    const artist = useArtistStore((s) => s.artist);
    const router = useRouter();

    useEffect(() => {
      if (!artist) {
        router.replace('/artist/login');
      }
    }, [artist, router]);

    if (!artist) {
      return (
        <div className="flex h-screen items-center justify-center bg-spotify-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-spotify-green border-t-transparent" />
        </div>
      );
    }

    return <Component {...props} />;
  };
}
