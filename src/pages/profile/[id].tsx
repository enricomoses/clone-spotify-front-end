import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import { User, ListMusic, Users } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { withAuth } from '@/utils/withAuth';
import FollowButton from '@/components/social/FollowButton';
import PlaylistCard from '@/components/playlist/PlaylistCard';
import { PageLoading } from '@/components/ui/Spinner';
import type { User as UserType, Playlist } from '@/types';

function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: userData, isLoading } = useSWR<UserType>(
    id ? `/users/${id}` : null,
    fetcher
  );

  const { data: playlists } = useSWR<Playlist[]>('/playlists', fetcher);

  if (isLoading || !userData) return <PageLoading />;

  const userPlaylists = playlists?.filter((p) => p.id_user === userData.id_user) || [];

  return (
    <>
      <Head>
        <title>{userData.name} — Spotify Clone</title>
      </Head>

      <div className="-mt-[60px]">
        {/* Banner */}
        <div
          className="relative flex items-end gap-6 px-8 pt-24 pb-8"
          style={{
            background:
              'linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), linear-gradient(135deg, #4338ca 0%, #1e1b4b 100%)',
            minHeight: '340px',
          }}
        >
          {/* Avatar */}
          <div className="w-48 h-48 shrink-0 rounded-full overflow-hidden shadow-2xl shadow-black/50">
            {userData.profile_picture ? (
              <img
                src={userData.profile_picture}
                alt={userData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-spotify-card flex items-center justify-center">
                <User className="w-16 h-16 text-spotify-muted" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-end">
            <p className="text-sm font-bold uppercase text-white/80 mb-1">
              Profile
            </p>
            <h1 className="text-5xl font-black text-white mb-3 leading-tight">
              {userData.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-white/70">
              {userPlaylists.length > 0 && (
                <span className="flex items-center gap-1">
                  <ListMusic className="w-4 h-4" />
                  {userPlaylists.length} public playlists
                </span>
              )}
              {userData.following && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {userData.following.length} following
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Follow */}
          <div className="mb-8">
            <FollowButton size="md" />
          </div>

          {/* Public Playlists */}
          {userPlaylists.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-5">
                Public Playlists
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {userPlaylists.map((playlist) => (
                  <PlaylistCard key={playlist.id_playlist} playlist={playlist} />
                ))}
              </div>
            </section>
          )}

          {/* Followed Playlists */}
          {userData.followedPlaylists && userData.followedPlaylists.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-5">
                Followed Playlists
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {userData.followedPlaylists.map((playlist) => (
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

export default withAuth(UserProfilePage);
