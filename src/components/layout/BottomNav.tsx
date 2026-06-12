import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Search, Library, Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/liked-songs', label: 'Liked Songs', icon: Heart, authOnly: true },
  { href: '/profile', label: 'Your Library', icon: Library, authOnly: true },
];

const guestNavItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
];

export default function BottomNav() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const items = user ? navItems : guestNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-lg border-t border-white/5">
      <div className="flex items-center justify-around h-14 px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive =
            router.pathname === href ||
            (href === '/profile' && router.pathname.startsWith('/profile'));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors',
                isActive ? 'text-white' : 'text-spotify-muted'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-colors',
                  isActive ? 'text-white' : 'text-spotify-muted',
                  href === '/liked-songs' && isActive && 'fill-current'
                )}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
