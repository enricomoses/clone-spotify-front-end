import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import { User, ListMusic, Users } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { withAuth } from '@/utils/withAuth';
import FollowButton from '@/components/social/FollowButton';
import PlaylistCard from '@/components/playlist/PlaylistCard';
import { ProfileSkeleton } from '@/components/ui/SkeletonCard';
import type { User as UserType, Playlist } from '@/types';

function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: userData, isLoading } = useSWR<UserType>(
    id ? `/users/${id}` : null,
    fetcher
  );

  const { data: playlists } = useSWR<Playlist[]>('/playlists', fetcher);

  if (isLoading || !userData) return <ProfileSkeleton />;

  const userPlaylists = playlists?.filter((p) => p.id_user === userData.id_user) || [];

  return (
    <>
      <Head>
        <title>{userData.name} — Spotify Clone</title>
      </Head>

      <div className="-mt-[60px]">
        {/* Banner */}
        <div
          className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 px-4 sm:px-8 pt-20 sm:pt-24 pb-6 sm:pb-8"
          style={{
            background:
              'linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), linear-gradient(135deg, #4338ca 0%, #1e1b4b 100%)',
            minHeight: '340px',
          }}
        >
          {/* Avatar */}
          <div className="w-32 h-32 sm:w-44 md:w-48 sm:h-44 md:h-48 shrink-0 rounded-full overflow-hidden shadow-2xl shadow-black/50">
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
          <div className="flex flex-col items-center sm:items-start justify-end text-center sm:text-left">
            <p className="text-xs sm:text-sm font-bold uppercase text-white/80 mb-1">
              Profile
            </p>
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-2 sm:mb-3 leading-tight">
              {userData.name}
            </h1>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/70 flex-wrap justify-center sm:justify-start">
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
        <div className="px-4 sm:px-8 py-6">
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
          {userData.followed_playlists && userData.followed_playlists.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-5">
                Followed Playlists
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {userData.followed_playlists.map((playlist) => (
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
