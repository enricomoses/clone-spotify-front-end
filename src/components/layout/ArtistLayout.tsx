import { ReactNode, useEffect } from 'react';
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
  Calendar,
  Sidebar,
} from 'lucide-react';
import { useArtistStore } from '@/stores/useArtistStore';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/useUIStore';

interface ArtistLayoutProps {
  children: ReactNode;
}

const artistNavItems = [
  { href: '/artist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/artist/songs', label: 'Songs', icon: Music },
  { href: '/artist/albums', label: 'Albums', icon: Disc3 },
  { href: '/artist/concerts', label: 'Concerts', icon: Calendar },
  { href: '/artist/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/artist/gallery', label: 'Gallery', icon: Image },
  { href: '/artist/profile/edit', label: 'Edit Profile', icon: UserCircle },
];

export default function ArtistLayout({ children }: ArtistLayoutProps) {
  const router = useRouter();
  const artist = useArtistStore((s) => s.artist);
  const logout = useArtistStore((s) => s.logout);

  const isCollapsed = useUIStore((s) => s.isSidebarCollapsed);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  const toggleCollapse = useUIStore((s) => s.toggleSidebarCollapsed);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') {
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);

  return (
    <div className="flex h-screen bg-spotify-black text-white overflow-hidden">
      {/* Artist Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-black h-full shrink-0 border-r border-spotify-border/30 transition-all duration-300 ease-spotify',
          isCollapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {/* Logo */}
        <div className={cn('pt-6 pb-6', isCollapsed ? 'px-4 flex justify-center' : 'px-6')}>
          <Link href="/artist/dashboard" className="flex items-center gap-2 group">
            <img src="/general/logo.svg" className="w-8 h-8 shrink-0" alt="Spotify Logo" />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-base font-bold text-white leading-tight">
                  Spotify
                </span>
                <span className="text-[10px] font-semibold text-spotify-green uppercase tracking-wider">
                  for Artists
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2">
          <ul className="space-y-1">
            {artistNavItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center transition-all duration-200 text-sm font-medium rounded-lg',
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-4 py-2.5',
                    router.pathname.startsWith(href)
                      ? 'text-white bg-spotify-green/20 border-l-2 border-spotify-green'
                      : 'text-spotify-muted hover:text-white hover:bg-white/5'
                  )}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span>{label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Artist Info */}
        <div className="py-4 border-t border-spotify-border/30 px-2">
          {artist && (
            <div className={cn('flex items-center mb-3', isCollapsed ? 'justify-center' : 'gap-3 px-3')}>
              <div className="w-9 h-9 rounded-full bg-spotify-card flex items-center justify-center overflow-hidden shrink-0" title={isCollapsed ? artist.name : undefined}>
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
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {artist.name}
                  </p>
                  <p className="text-xs text-spotify-muted truncate">{artist.email}</p>
                </div>
              )}
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              'flex items-center rounded-lg text-sm font-medium text-spotify-muted hover:text-white hover:bg-white/5 transition-all',
              isCollapsed ? 'justify-center p-2.5 w-full' : 'gap-3 px-4 py-2.5 w-full'
            )}
            title={isCollapsed ? 'Log out' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Artist Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-spotify-black/90 backdrop-blur-md border-b border-spotify-border/20">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex w-8 h-8 items-center justify-center text-spotify-muted hover:text-white transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Sidebar className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white">
              {artistNavItems.find((item) =>
                router.pathname.startsWith(item.href)
              )?.label || 'Dashboard'}
            </h2>
          </div>
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
