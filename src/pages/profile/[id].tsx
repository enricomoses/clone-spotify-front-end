import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';
import { User as UserIcon, ListMusic, Users, Mic2 } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { useAuthStore } from '@/stores/useAuthStore';
import FollowButton from '@/components/social/FollowButton';
import PlaylistCard from '@/components/playlist/PlaylistCard';
import PodcastCard from '@/components/podcast/PodcastCard';
import { UserProfileSkeleton } from '@/components/ui/SkeletonCard';
import api from '@/lib/axios';
import type { User as UserType } from '@/types';

export default function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const currentUser = useAuthStore((s) => s.user);

  // Redirect to own profile if viewing yourself
  useEffect(() => {
    if (id && currentUser && id === currentUser.id_user) {
      router.replace('/profile');
    }
  }, [id, currentUser, router]);

  const { data: profileData, isLoading, mutate } = useSWR<UserType>(
    id && id !== currentUser?.id_user ? `/users/${id}/profile` : null,
    fetcher
  );

  // Refresh logged-in user's profile on mount to sync follow status
  useEffect(() => {
    if (currentUser) {
      useAuthStore.getState().refreshUser();
    }
  }, [id, currentUser?.id_user]);

  if (isLoading || !profileData) return <UserProfileSkeleton />;

  // Check if the current user follows this user
  const isFollowing = currentUser?.following?.some(
    (u) => u.id_user === profileData?.id_user
  ) ?? false;

  const handleFollow = async () => {
    if (!currentUser) return;
    await api.post(`/users/${currentUser.id_user}/follow-user`, {
      target_id: profileData.id_user,
    });
    mutate();
    useAuthStore.getState().refreshUser();
  };

  const handleUnfollow = async () => {
    if (!currentUser) return;
    await api.post(`/users/${currentUser.id_user}/unfollow-user/${profileData.id_user}`, {
      _method: 'DELETE',
    });
    mutate();
    useAuthStore.getState().refreshUser();
  };

  const userPlaylists = profileData.user_playlists || [];
  const userPodcasts = profileData.podcasts || [];
  const recentArtists = profileData.recent_artists || [];
  const followersCount = profileData.followers_count ?? profileData.followers?.length ?? 0;
  const followingCount = profileData.following_count ?? profileData.following?.length ?? 0;

  return (
    <>
      <Head>
        <title>{profileData.name} — Spotify Clone</title>
        <meta name="description" content={`View ${profileData.name}'s profile on Spotify Clone`} />
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
          <div className="w-32 h-32 sm:w-44 md:w-52 sm:h-44 md:h-52 shrink-0 rounded-full overflow-hidden shadow-2xl shadow-black/50">
            {profileData.profile_picture ? (
              <img
                src={profileData.profile_picture}
                alt={profileData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-spotify-card flex items-center justify-center">
                <UserIcon className="w-16 sm:w-20 h-16 sm:h-20 text-spotify-muted" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col items-center sm:items-start justify-end text-center sm:text-left">
            <p className="text-xs sm:text-sm font-bold uppercase text-white/80 mb-1">
              Profile
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-2 sm:mb-3 leading-tight">
              {profileData.name}
            </h1>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/70 flex-wrap justify-center sm:justify-start">
              {userPlaylists.length > 0 && (
                <span className="flex items-center gap-1">
                  <ListMusic className="w-4 h-4" />
                  {userPlaylists.length} playlists
                </span>
              )}
              {followersCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {followersCount} followers
                </span>
              )}
              {followingCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {followingCount} following
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          <div
            className="absolute inset-0 h-60"
            style={{
              background: 'linear-gradient(rgba(67,56,202,.25), #121212)',
            }}
          />

          <div className="relative z-10 px-4 sm:px-8 py-6">
            {/* Follow button */}
            <div className="mb-8">
              <FollowButton
                isFollowing={isFollowing}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                size="md"
              />
            </div>

            {/* User Playlists */}
            {userPlaylists.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-5">
                  Public Playlists
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {userPlaylists.map((playlist) => (
                    <PlaylistCard key={playlist.id_playlist} playlist={playlist} />
                  ))}
                </div>
              </section>
            )}

            {/* User Podcasts */}
            {userPodcasts.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 flex items-center gap-2">
                  <Mic2 className="w-5 h-5 text-spotify-green" />
                  Podcasts
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {userPodcasts.map((podcast) => (
                    <PodcastCard key={podcast.id_podcast} podcast={podcast} />
                  ))}
                </div>
              </section>
            )}

            {/* Recent Played Artists */}
            {recentArtists.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-5">
                  Recently Played Artists
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {recentArtists.map((artist) => (
                    <Link
                      key={artist.id_artist}
                      href={`/artist/${artist.id_artist}`}
                      className="block bg-spotify-card/60 hover:bg-spotify-hover rounded-lg p-4 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 group"
                    >
                      <div className="relative aspect-square mb-4 rounded-full overflow-hidden bg-spotify-dark shadow-xl mx-auto">
                        {artist.profile_picture ? (
                          <img
                            src={artist.profile_picture}
                            alt={artist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-12 h-12 text-spotify-muted" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-bold text-white truncate text-center mb-1">
                        {artist.name}
                      </p>
                      <p className="text-xs text-spotify-muted text-center">Artist</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {userPlaylists.length === 0 && userPodcasts.length === 0 && recentArtists.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[20vh] text-center">
                <UserIcon className="w-12 h-12 text-spotify-muted/30 mb-3" />
                <p className="text-sm text-spotify-muted">
                  This user hasn&apos;t shared any public content yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
