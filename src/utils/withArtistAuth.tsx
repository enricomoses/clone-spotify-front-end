import { useEffect, useState, type ComponentType } from 'react';
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
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      const checkHydration = () => {
        if (useArtistStore.persist.hasHydrated()) {
          setHydrated(true);
        } else {
          const unsub = useArtistStore.persist.onFinishHydration(() => {
            setHydrated(true);
          });
          return unsub;
        }
      };

      const unsub = checkHydration();
      return () => {
        if (unsub) unsub();
      };
    }, []);

    useEffect(() => {
      if (hydrated && !artist) {
        router.replace('/artist/login');
      }
    }, [hydrated, artist, router]);

    if (!hydrated || !artist) {
      return (
        <div className="flex h-screen items-center justify-center bg-spotify-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-spotify-green border-t-transparent" />
        </div>
      );
    }

    return <Component {...props} />;
  };
}
