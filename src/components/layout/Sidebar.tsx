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
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ChevronDown,
  ListMusic,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';

const mainNavItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/genres', label: 'Genre', icon: LayoutGrid },
  { href: '/discover-weekly', label: 'Discover Weekly', icon: Compass },
  { href: '/concerts', label: 'Concerts', icon: Calendar },
];

export default function Sidebar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { requireAuth } = useRequireAuth();

  const isCollapsed = useUIStore((s) => s.isSidebarCollapsed);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  const [isCreatedOpen, setIsCreatedOpen] = useState(true);
  const [isCollabOpen, setIsCollabOpen] = useState(true);
  const [isFollowedOpen, setIsFollowedOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') {
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-black h-full shrink-0 transition-all duration-300 ease-spotify relative',
        isCollapsed ? 'w-[72px]' : 'w-[280px]'
      )}
    >


      {/* Logo */}
      <div className={cn('pt-6 pb-4', isCollapsed ? 'px-4 flex justify-center' : 'px-6')}>
        <Link href="/home" className="flex items-center gap-2 group">
          <img src="/general/logo.svg" className="w-8 h-8 shrink-0" alt="Spotify Logo" />
          {!isCollapsed && (
            <span className="text-xl font-bold text-white tracking-tight">
              Spotify
            </span>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="px-2 mb-2">
        <ul className="space-y-0.5">
          {mainNavItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              router.pathname === href ||
              (href === '/genres' && router.pathname.startsWith('/genres'));

            return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-4 rounded-md transition-all duration-200 group',
                  isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3',
                  isActive
                    ? 'text-white bg-spotify-card'
                    : 'text-spotify-muted hover:text-white'
                )}
                title={isCollapsed ? label : undefined}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors shrink-0',
                    isActive
                      ? 'text-white'
                      : 'text-spotify-muted group-hover:text-white'
                  )}
                />
                {!isCollapsed && (
                  <span className="font-semibold text-sm">{label}</span>
                )}
              </Link>
            </li>
            );
          })}
        </ul>
      </nav>

      {/* Divider */}
      <hr className={cn('border-spotify-border my-2', isCollapsed ? 'mx-3' : 'mx-6')} />

      {user ? (
        <>
          {/* Library Section — Logged In */}
          <div className="px-2 mb-2">
            {!isCollapsed && (
              <div className="flex items-center gap-4 px-4 py-3 text-spotify-muted">
                <Library className="w-6 h-6" />
                <span className="font-semibold text-sm uppercase tracking-wider text-xs">
                  Your Library
                </span>
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center py-3">
                <Library className="w-6 h-6 text-spotify-muted" />
              </div>
            )}

            {/* Create Playlist */}
            <button
              onClick={() => requireAuth(() => router.push('/playlist/create'))}
              className={cn(
                'flex items-center rounded-md text-spotify-muted hover:text-white transition-colors group w-full text-left',
                isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-4 px-4 py-2.5'
              )}
              title={isCollapsed ? 'Create Playlist' : undefined}
            >
              <div className="w-6 h-6 bg-spotify-muted group-hover:bg-white rounded-sm flex items-center justify-center transition-colors shrink-0">
                <PlusSquare className="w-4 h-4 text-black" />
              </div>
              {!isCollapsed && (
                <span className="font-semibold text-sm">Create Playlist</span>
              )}
            </button>

            {/* Liked Songs */}
            <Link
              href="/liked-songs"
              className={cn(
                'flex items-center rounded-md text-spotify-muted hover:text-white transition-colors group',
                isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-4 px-4 py-2.5',
                router.pathname === '/liked-songs' && 'text-white'
              )}
              title={isCollapsed ? 'Liked Songs' : undefined}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-blue-200 rounded-sm flex items-center justify-center shrink-0">
                <Heart className="w-3 h-3 text-white fill-white" />
              </div>
              {!isCollapsed && (
                <span className="font-semibold text-sm">Liked Songs</span>
              )}
            </Link>

            {/* My Podcasts */}
            <Link
              href="/my-podcasts"
              className={cn(
                'flex items-center rounded-md transition-colors group',
                isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-4 px-4 py-2.5',
                router.pathname.startsWith('/my-podcasts')
                  ? 'text-white'
                  : 'text-spotify-muted hover:text-white'
              )}
              title={isCollapsed ? 'Podcast Saya' : undefined}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-green-600 to-spotify-dark rounded-sm flex items-center justify-center shrink-0">
                <Mic className="w-3 h-3 text-white" />
              </div>
              {!isCollapsed && (
                <span className="font-semibold text-sm">Podcast Saya</span>
              )}
            </Link>

            {/* Podcasts Browse */}
            <Link
              href="/podcast"
              className={cn(
                'flex items-center rounded-md transition-colors group',
                isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-4 px-4 py-2.5',
                router.pathname.startsWith('/podcast')
                  ? 'text-white'
                  : 'text-spotify-muted hover:text-white'
              )}
              title={isCollapsed ? 'Podcasts' : undefined}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-500 rounded-sm flex items-center justify-center shrink-0">
                <Radio className="w-3 h-3 text-white" />
              </div>
              {!isCollapsed && (
                <span className="font-semibold text-sm">Podcasts</span>
              )}
            </Link>
          </div>

          {/* Divider */}
          <hr className={cn('border-spotify-border my-1', isCollapsed ? 'mx-3' : 'mx-6')} />

          {/* Scrollable Playlists Area — hidden when collapsed */}
          {!isCollapsed && (
            <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-hidden">
              <p className="px-4 py-2 text-xs text-spotify-muted uppercase tracking-wider font-semibold">
                Playlists
              </p>
              
              {(() => {
                const allCollaborative = user.collaborative_playlists || [];
                const createdPlaylists = allCollaborative.filter((p) => p.pivot?.role === 'Owner');
                const collaborativePlaylists = allCollaborative.filter((p) => p.pivot?.role === 'Editor');
                const followedPlaylists = user.followed_playlists || [];

                const hasPlaylists =
                  createdPlaylists.length > 0 ||
                  collaborativePlaylists.length > 0 ||
                  followedPlaylists.length > 0;

                const getPlaylistOwnerName = (playlist: any) => {
                  const owner = playlist.collaborators?.find((c: any) => c.pivot?.role === 'Owner');
                  if (!owner) return 'Spotify';
                  return owner.id_user === user.id_user ? 'Anda' : owner.name;
                };

                if (!hasPlaylists) {
                  return (
                    <div className="space-y-0.5">
                      <p className="px-4 py-2 text-xs text-spotify-muted/60">
                        Your playlists will appear here
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {/* Created Playlists */}
                    {createdPlaylists.length > 0 && (
                      <div className="space-y-1">
                        <button
                          onClick={() => setIsCreatedOpen(!isCreatedOpen)}
                          className="flex items-center justify-between w-full px-4 py-1 text-xs font-bold text-spotify-muted hover:text-white uppercase tracking-wider transition-colors text-left group"
                        >
                          <span>Created ({createdPlaylists.length})</span>
                          {isCreatedOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-spotify-muted group-hover:text-white transition-colors shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-spotify-muted group-hover:text-white transition-colors shrink-0" />
                          )}
                        </button>
                        
                        {isCreatedOpen && (
                          <div className="space-y-0.5 pl-1">
                            {createdPlaylists.map((playlist) => (
                              <Link
                                key={playlist.id_playlist}
                                href={`/playlist/${playlist.id_playlist}`}
                                className="flex items-center gap-3 px-3 py-1.5 text-sm text-spotify-muted hover:text-white hover:bg-spotify-card/40 rounded-md transition-colors group"
                              >
                                <div className="w-6 h-6 rounded bg-spotify-card flex items-center justify-center overflow-hidden shrink-0">
                                  {playlist.cover_image ? (
                                    <img
                                      src={playlist.cover_image}
                                      alt={playlist.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <ListMusic className="w-3.5 h-3.5 text-spotify-muted group-hover:text-white transition-colors" />
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="font-medium text-sm truncate text-white/95 group-hover:text-white transition-colors">
                                    {playlist.name}
                                  </span>
                                  <span className="text-[11px] text-spotify-muted truncate font-normal">
                                    Playlist • Anda
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Collaborative Playlists */}
                    {collaborativePlaylists.length > 0 && (
                      <div className="space-y-1">
                        <button
                          onClick={() => setIsCollabOpen(!isCollabOpen)}
                          className="flex items-center justify-between w-full px-4 py-1 text-xs font-bold text-spotify-muted hover:text-white uppercase tracking-wider transition-colors text-left group"
                        >
                          <span>Collaborating ({collaborativePlaylists.length})</span>
                          {isCollabOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-spotify-muted group-hover:text-white transition-colors shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-spotify-muted group-hover:text-white transition-colors shrink-0" />
                          )}
                        </button>

                        {isCollabOpen && (
                          <div className="space-y-0.5 pl-1">
                            {collaborativePlaylists.map((playlist) => (
                              <Link
                                key={playlist.id_playlist}
                                href={`/playlist/${playlist.id_playlist}`}
                                className="flex items-center gap-3 px-3 py-1.5 text-sm text-spotify-muted hover:text-white hover:bg-spotify-card/40 rounded-md transition-colors group"
                              >
                                <div className="w-6 h-6 rounded bg-spotify-card flex items-center justify-center overflow-hidden shrink-0">
                                  {playlist.cover_image ? (
                                    <img
                                      src={playlist.cover_image}
                                      alt={playlist.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Users className="w-3.5 h-3.5 text-spotify-muted group-hover:text-white transition-colors" />
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="font-medium text-sm truncate text-white/95 group-hover:text-white transition-colors">
                                    {playlist.name}
                                  </span>
                                  <span className="text-[11px] text-spotify-muted truncate font-normal">
                                    Kolaboratif • {getPlaylistOwnerName(playlist)}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Followed Playlists */}
                    {followedPlaylists.length > 0 && (
                      <div className="space-y-1">
                        <button
                          onClick={() => setIsFollowedOpen(!isFollowedOpen)}
                          className="flex items-center justify-between w-full px-4 py-1 text-xs font-bold text-spotify-muted hover:text-white uppercase tracking-wider transition-colors text-left group"
                        >
                          <span>Followed ({followedPlaylists.length})</span>
                          {isFollowedOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-spotify-muted group-hover:text-white transition-colors shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-spotify-muted group-hover:text-white transition-colors shrink-0" />
                          )}
                        </button>

                        {isFollowedOpen && (
                          <div className="space-y-0.5 pl-1">
                            {followedPlaylists.map((playlist) => (
                              <Link
                                key={playlist.id_playlist}
                                href={`/playlist/${playlist.id_playlist}`}
                                className="flex items-center gap-3 px-3 py-1.5 text-sm text-spotify-muted hover:text-white hover:bg-spotify-card/40 rounded-md transition-colors group"
                              >
                                <div className="w-6 h-6 rounded bg-spotify-card flex items-center justify-center overflow-hidden shrink-0">
                                  {playlist.cover_image ? (
                                    <img
                                      src={playlist.cover_image}
                                      alt={playlist.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <ListMusic className="w-3.5 h-3.5 text-spotify-muted group-hover:text-white transition-colors" />
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="font-medium text-sm truncate text-white/95 group-hover:text-white transition-colors">
                                    {playlist.name}
                                  </span>
                                  <span className="text-[11px] text-spotify-muted truncate font-normal">
                                    Playlist • {getPlaylistOwnerName(playlist)}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
          {isCollapsed && <div className="flex-1" />}

          {/* User Info / Logout */}
          <div className="px-2 py-3 border-t border-spotify-border">
            <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'justify-between px-4')}>
              <Link
                href="/profile"
                className="flex items-center gap-3 group"
                title={isCollapsed ? user.name : undefined}
              >
                <div className="w-7 h-7 rounded-full bg-spotify-card flex items-center justify-center overflow-hidden shrink-0">
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
                {!isCollapsed && (
                  <span className="text-sm font-semibold text-spotify-muted group-hover:text-white transition-colors truncate max-w-[140px]">
                    {user.name}
                  </span>
                )}
              </Link>
              {!isCollapsed && (
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
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Guest Sidebar */}
          {!isCollapsed ? (
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
          ) : (
            <div className="flex-1" />
          )}

          {/* Login / Register Buttons */}
          {!isCollapsed ? (
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
          ) : (
            <div className="px-2 py-4 border-t border-spotify-border flex flex-col items-center gap-2">
              <Link
                href="/login"
                className="w-10 h-10 bg-spotify-card hover:bg-spotify-hover rounded-full flex items-center justify-center transition-colors"
                title="Login"
              >
                <LogIn className="w-5 h-5 text-spotify-muted" />
              </Link>
            </div>
          )}
        </>
      )}
    </aside>
  );
}
