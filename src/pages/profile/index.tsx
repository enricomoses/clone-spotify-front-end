import Head from 'next/head';
import { withAuth } from '@/utils/withAuth';
import useSWR from 'swr';
import Link from 'next/link';
import { User, ListMusic, Users, Settings } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { useAuthStore } from '@/stores/useAuthStore';
import PlaylistCard from '@/components/playlist/PlaylistCard';
import { ProfileSkeleton } from '@/components/ui/SkeletonCard';
import type { User as UserType, Playlist } from '@/types';

function ProfilePage() {
  const currentUser = useAuthStore((s) => s.user);

  const { data: userData, isLoading } = useSWR<UserType>(
    currentUser ? `/users/${currentUser.id_user}` : null,
    fetcher
  );

  const { data: playlists } = useSWR<Playlist[]>('/playlists', fetcher);

  if (isLoading) return <ProfileSkeleton />;

  const user = userData || currentUser;
  if (!user) return null;

  // Filter playlists owned by user
  const userPlaylists = playlists?.filter((p) => p.id_user === user.id_user) || [];

  return (
    <>
      <Head>
        <title>Profile — Spotify Clone</title>
      </Head>

      <div className="-mt-[60px]">
        {/* Banner — responsive */}
        <div
          className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 px-4 sm:px-8 pt-20 sm:pt-24 pb-6 sm:pb-8"
          style={{
            background:
              'linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), linear-gradient(135deg, #374151 0%, #1f2937 100%)',
            minHeight: '300px',
          }}
        >
          {/* Avatar */}
          <Link
            href="/profile/edit"
            className="group relative block w-32 h-32 sm:w-44 md:w-52 sm:h-44 md:h-52 shrink-0 rounded-full overflow-hidden shadow-2xl shadow-black/50 cursor-pointer"
            title="Edit Profile"
          >
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name}
                className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-300"
              />
            ) : (
              <div className="w-full h-full bg-spotify-card flex items-center justify-center group-hover:bg-spotify-hover transition-colors duration-300">
                <User className="w-16 sm:w-20 h-16 sm:h-20 text-spotify-muted" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 text-white">
              <Settings className="w-6 h-6 animate-pulse" />
              <span className="text-xs font-bold tracking-wide">Edit Profile</span>
            </div>
          </Link>

          {/* User Info */}
          <div className="flex flex-col items-center sm:items-start justify-end text-center sm:text-left">
            <p className="text-xs sm:text-sm font-bold uppercase text-white/80 mb-1">
              Profile
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-2 sm:mb-3 leading-tight">
              {user.name}
            </h1>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/70 flex-wrap justify-center sm:justify-start">
              {userPlaylists.length > 0 && (
                <span className="flex items-center gap-1">
                  <ListMusic className="w-4 h-4" />
                  {userPlaylists.length} playlists
                </span>
              )}
              {user.following && user.following.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {user.following.length} following
                </span>
              )}
              {user.followers && user.followers.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {user.followers.length} followers
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-8 py-6 sm:py-8">
          {/* User Details */}
          <section className="mb-8 sm:mb-10">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-white">About</h2>
              <Link
                href="/profile/edit"
                className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white/80 hover:text-white transition-colors bg-spotify-card/50 hover:bg-spotify-card border border-spotify-border/60 hover:border-spotify-border px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full"
              >
                <Settings className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                Edit Profile
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {user.email && (
                <div className="bg-spotify-card/50 rounded-lg p-4">
                  <p className="text-xs text-spotify-muted mb-1">Email</p>
                  <p className="text-sm text-white font-medium truncate">{user.email}</p>
                </div>
              )}
              {user.country && (
                <div className="bg-spotify-card/50 rounded-lg p-4">
                  <p className="text-xs text-spotify-muted mb-1">Country</p>
                  <p className="text-sm text-white font-medium">{user.country}</p>
                </div>
              )}
              {user.gender && (
                <div className="bg-spotify-card/50 rounded-lg p-4">
                  <p className="text-xs text-spotify-muted mb-1">Gender</p>
                  <p className="text-sm text-white font-medium">{user.gender}</p>
                </div>
              )}
              {user.birthday && (
                <div className="bg-spotify-card/50 rounded-lg p-4">
                  <p className="text-xs text-spotify-muted mb-1">Birthday</p>
                  <p className="text-sm text-white font-medium">
                    {new Date(user.birthday).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* User Playlists */}
          {userPlaylists.length > 0 && (
            <section className="mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-5">
                Your Playlists
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {userPlaylists.map((playlist) => (
                  <PlaylistCard key={playlist.id_playlist} playlist={playlist} />
                ))}
              </div>
            </section>
          )}

          {/* Followed Playlists */}
          {user.followed_playlists && user.followed_playlists.length > 0 && (
            <section className="mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-5">
                Followed Playlists
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {user.followed_playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id_playlist} playlist={playlist} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

export default withAuth(ProfilePage);
