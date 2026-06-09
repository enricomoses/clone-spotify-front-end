import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

/**
 * Hook for requiring authentication before performing an action.
 * If the user is not logged in, saves the current page and redirects to /login.
 */
export function useRequireAuth() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const requireAuth = useCallback(
    (callback: () => void) => {
      if (!user) {
        // Save current page for redirect after login
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectAfterLogin', router.asPath);
        }
        router.push('/login');
        return;
      }
      callback();
    },
    [user, router]
  );

  return { requireAuth, user, isLoggedIn: !!user };
}
