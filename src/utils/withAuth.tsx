import { useEffect, type ComponentType } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Higher Order Component to protect user routes.
 * Redirects to /login if not authenticated.
 */
export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function ProtectedPage(props: P) {
    const user = useAuthStore((s) => s.user);
    const router = useRouter();

    useEffect(() => {
      if (!user) {
        router.replace('/login');
      }
    }, [user, router]);

    if (!user) {
      return (
        <div className="flex h-screen items-center justify-center bg-spotify-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-spotify-green border-t-transparent" />
        </div>
      );
    }

    return <Component {...props} />;
  };
}
