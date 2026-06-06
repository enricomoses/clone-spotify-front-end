import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Music,
  Disc3,
  BarChart3,
  Image,
  UserCircle,
  LogOut,
  Music2,
} from 'lucide-react';
import { useArtistStore } from '@/stores/useArtistStore';
import { cn } from '@/lib/utils';

interface ArtistLayoutProps {
  children: ReactNode;
}

const artistNavItems = [
  { href: '/artist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/artist/songs', label: 'Songs', icon: Music },
  { href: '/artist/albums', label: 'Albums', icon: Disc3 },
  { href: '/artist/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/artist/gallery', label: 'Gallery', icon: Image },
  { href: '/artist/profile/edit', label: 'Edit Profile', icon: UserCircle },
];

export default function ArtistLayout({ children }: ArtistLayoutProps) {
  const router = useRouter();
  const artist = useArtistStore((s) => s.artist);
  const logout = useArtistStore((s) => s.logout);

  return (
    <div className="flex h-screen bg-spotify-black text-white overflow-hidden">
      {/* Artist Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-black h-full shrink-0 border-r border-spotify-border/30">
        {/* Logo */}
        <div className="px-6 pt-6 pb-6">
          <Link href="/artist/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center group-hover:bg-spotify-green-bright transition-colors">
              <Music2 className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white leading-tight">
                Spotify
              </span>
              <span className="text-[10px] font-semibold text-spotify-green uppercase tracking-wider">
                for Artists
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          <ul className="space-y-1">
            {artistNavItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium',
                    router.pathname.startsWith(href)
                      ? 'text-white bg-spotify-green/20 border-l-2 border-spotify-green'
                      : 'text-spotify-muted hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Artist Info */}
        <div className="px-3 py-4 border-t border-spotify-border/30">
          {artist && (
            <div className="flex items-center gap-3 px-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-spotify-card flex items-center justify-center overflow-hidden">
                {artist.profile_picture ? (
                  <img
                    src={artist.profile_picture}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-5 h-5 text-spotify-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {artist.name}
                </p>
                <p className="text-xs text-spotify-muted truncate">{artist.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-spotify-muted hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Artist Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-spotify-black/90 backdrop-blur-md border-b border-spotify-border/20">
          <h2 className="text-lg font-bold text-white">
            {artistNavItems.find((item) =>
              router.pathname.startsWith(item.href)
            )?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-spotify-muted">
              {artist?.name}
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
