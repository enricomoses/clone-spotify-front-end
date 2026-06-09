import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  Search,
  Library,
  PlusSquare,
  Heart,
  Radio,
  LogOut,
  Compass,
  User,
  Mic,
  Calendar,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/discover-weekly', label: 'Discover Weekly', icon: Compass },
  { href: '/concerts', label: 'Concerts', icon: Calendar },
];

export default function Sidebar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { requireAuth } = useRequireAuth();

  return (
    <aside className="hidden lg:flex flex-col w-[280px] bg-black h-full shrink-0">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <Link href="/home" className="flex items-center gap-2 group">
          <img src="/general/logo.svg" className="w-8 h-8 shrink-0" alt="Spotify Logo" />
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

      {user ? (
        <>
          {/* Library Section — Logged In */}
          <div className="px-2 mb-2">
            <div className="flex items-center gap-4 px-4 py-3 text-spotify-muted">
              <Library className="w-6 h-6" />
              <span className="font-semibold text-sm uppercase tracking-wider text-xs">
                Your Library
              </span>
            </div>

            {/* Create Playlist */}
            <button
              onClick={() => requireAuth(() => router.push('/playlist/create'))}
              className="flex items-center gap-4 px-4 py-2.5 rounded-md text-spotify-muted hover:text-white transition-colors group w-full text-left"
            >
              <div className="w-6 h-6 bg-spotify-muted group-hover:bg-white rounded-sm flex items-center justify-center transition-colors">
                <PlusSquare className="w-4 h-4 text-black" />
              </div>
              <span className="font-semibold text-sm">Create Playlist</span>
            </button>

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

            {/* My Podcasts */}
            <Link
              href="/my-podcasts"
              className={cn(
                'flex items-center gap-4 px-4 py-2.5 rounded-md transition-colors group',
                router.pathname.startsWith('/my-podcasts')
                  ? 'text-white'
                  : 'text-spotify-muted hover:text-white'
              )}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-green-600 to-spotify-dark rounded-sm flex items-center justify-center">
                <Mic className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-sm">Podcast Saya</span>
            </Link>

            {/* Podcasts Browse */}
            <Link
              href="/podcast"
              className={cn(
                'flex items-center gap-4 px-4 py-2.5 rounded-md transition-colors group',
                router.pathname.startsWith('/podcast')
                  ? 'text-white'
                  : 'text-spotify-muted hover:text-white'
              )}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-500 rounded-sm flex items-center justify-center">
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
            <div className="space-y-0.5">
              {user.followed_playlists && user.followed_playlists.length > 0 ? (
                user.followed_playlists.map((playlist) => (
                  <Link
                    key={playlist.id_playlist}
                    href={`/playlist/${playlist.id_playlist}`}
                    className="block px-4 py-1.5 text-sm text-spotify-muted hover:text-white transition-colors truncate"
                  >
                    {playlist.name}
                  </Link>
                ))
              ) : (
                <p className="px-4 py-2 text-xs text-spotify-muted/60">
                  Your playlists will appear here
                </p>
              )}
            </div>
          </div>

          {/* User Info / Logout */}
          <div className="px-2 py-3 border-t border-spotify-border">
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
                onClick={() => {
                  logout();
                  router.push('/home');
                }}
                className="text-spotify-muted hover:text-white transition-colors p-1"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Guest Sidebar */}
          <div className="flex-1 px-2 py-4">
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-spotify-muted mb-1">
                Login untuk akses fitur penuh
              </p>
              <p className="text-xs text-spotify-muted/60">
                Buat playlist, like lagu, dan follow artis
              </p>
            </div>
          </div>

          {/* Login / Register Buttons */}
          <div className="px-4 py-4 space-y-2 border-t border-spotify-border">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-transform"
            >
              <UserPlus className="w-4 h-4" />
              Daftar Gratis
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-spotify-muted text-sm font-bold rounded-full hover:text-white transition-colors border border-spotify-border/30 hover:border-white/30"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          </div>
        </>
      )}
    </aside>
  );
}
