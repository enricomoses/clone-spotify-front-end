import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Link from 'next/link';
import { User, Music2, ListMusic, Users } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { useAuthStore } from '@/stores/useAuthStore';
import PlaylistCard from '@/components/playlist/PlaylistCard';
import { PageLoading } from '@/components/ui/Spinner';
import type { User as UserType, Playlist } from '@/types';

function ProfilePage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  const { data: userData, isLoading } = useSWR<UserType>(
    currentUser ? `/users/${currentUser.id_user}` : null,
    fetcher
  );

  const { data: playlists } = useSWR<Playlist[]>('/playlists', fetcher);

  if (isLoading) return <PageLoading />;

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
        {/* Banner */}
        <div
          className="relative flex items-end gap-6 px-8 pt-24 pb-8"
          style={{
            background:
              'linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), linear-gradient(135deg, #374151 0%, #1f2937 100%)',
            minHeight: '340px',
          }}
        >
          {/* Avatar */}
          <div className="w-52 h-52 shrink-0 rounded-full overflow-hidden shadow-2xl shadow-black/50">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-spotify-card flex items-center justify-center">
                <User className="w-20 h-20 text-spotify-muted" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex flex-col justify-end">
            <p className="text-sm font-bold uppercase text-white/80 mb-1">
              Profile
            </p>
            <h1 className="text-6xl font-black text-white mb-3 leading-tight">
              {user.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-white/70">
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
        <div className="px-8 py-8">
          {/* User Details */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-5">About</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {user.email && (
                <div className="bg-spotify-card/50 rounded-lg p-4">
                  <p className="text-xs text-spotify-muted mb-1">Email</p>
                  <p className="text-sm text-white font-medium">{user.email}</p>
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
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-5">
                Your Playlists
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {userPlaylists.map((playlist) => (
                  <PlaylistCard key={playlist.id_playlist} playlist={playlist} />
                ))}
              </div>
            </section>
          )}

          {/* Followed Playlists */}
          {user.followed_playlists && user.followed_playlists.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-5">
                Followed Playlists
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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

export default ProfilePage;
