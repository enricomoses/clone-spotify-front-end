import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  Search,
  Library,
  PlusSquare,
  Heart,
  Music2,
  Radio,
  LogOut,
  Compass,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/discover-weekly', label: 'Discover Weekly', icon: Compass },
];

export default function Sidebar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="hidden lg:flex flex-col w-[280px] bg-black h-full shrink-0">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <Link href="/home" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center group-hover:bg-spotify-green-bright transition-colors">
            <Music2 className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Spotify
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="px-2 mb-2">
        <ul className="space-y-0.5">
          {mainNavItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-200 group',
                  router.pathname === href
                    ? 'text-white bg-spotify-card'
                    : 'text-spotify-muted hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors',
                    router.pathname === href
                      ? 'text-white'
                      : 'text-spotify-muted group-hover:text-white'
                  )}
                />
                <span className="font-semibold text-sm">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Divider */}
      <hr className="border-spotify-border mx-6 my-2" />

      {/* Library Section */}
      <div className="px-2 mb-2">
        <div className="flex items-center gap-4 px-4 py-3 text-spotify-muted">
          <Library className="w-6 h-6" />
          <span className="font-semibold text-sm uppercase tracking-wider text-xs">
            Your Library
          </span>
        </div>

        {/* Create Playlist */}
        <Link
          href="/playlist/create"
          className="flex items-center gap-4 px-4 py-2.5 rounded-md text-spotify-muted hover:text-white transition-colors group"
        >
          <div className="w-6 h-6 bg-spotify-muted group-hover:bg-white rounded-sm flex items-center justify-center transition-colors">
            <PlusSquare className="w-4 h-4 text-black" />
          </div>
          <span className="font-semibold text-sm">Create Playlist</span>
        </Link>

        {/* Liked Songs */}
        <Link
          href="/profile"
          className="flex items-center gap-4 px-4 py-2.5 rounded-md text-spotify-muted hover:text-white transition-colors group"
        >
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-blue-200 rounded-sm flex items-center justify-center">
            <Heart className="w-3 h-3 text-white fill-white" />
          </div>
          <span className="font-semibold text-sm">Liked Songs</span>
        </Link>

        {/* Podcasts */}
        <Link
          href="/podcast"
          className={cn(
            'flex items-center gap-4 px-4 py-2.5 rounded-md transition-colors group',
            router.pathname.startsWith('/podcast')
              ? 'text-white'
              : 'text-spotify-muted hover:text-white'
          )}
        >
          <div className="w-6 h-6 bg-gradient-to-br from-green-600 to-spotify-dark rounded-sm flex items-center justify-center">
            <Radio className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-sm">Podcasts</span>
        </Link>
      </div>

      {/* Divider */}
      <hr className="border-spotify-border mx-6 my-1" />

      {/* Scrollable Playlists Area */}
      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-hidden">
        <p className="px-4 py-2 text-xs text-spotify-muted uppercase tracking-wider font-semibold">
          Playlists
        </p>
        {/* Playlists will be rendered here from API data */}
        <div className="space-y-0.5">
          <p className="px-4 py-2 text-xs text-spotify-muted/60">
            Your playlists will appear here
          </p>
        </div>
      </div>

      {/* User Info / Logout */}
      <div className="px-2 py-3 border-t border-spotify-border">
        {user && (
          <div className="flex items-center justify-between px-4">
            <Link
              href="/profile"
              className="flex items-center gap-3 group"
            >
              <div className="w-7 h-7 rounded-full bg-spotify-card flex items-center justify-center overflow-hidden">
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-spotify-muted" />
                )}
              </div>
              <span className="text-sm font-semibold text-spotify-muted group-hover:text-white transition-colors truncate max-w-[140px]">
                {user.name}
              </span>
            </Link>
            <button
              onClick={logout}
              className="text-spotify-muted hover:text-white transition-colors p-1"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
