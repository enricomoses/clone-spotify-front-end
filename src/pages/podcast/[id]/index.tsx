import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import { Mic2 } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { withAuth } from '@/utils/withAuth';
import FollowButton from '@/components/social/FollowButton';
import EpisodeRow from '@/components/podcast/EpisodeRow';
import { PodcastDetailSkeleton } from '@/components/ui/SkeletonCard';
import type { Podcast } from '@/types';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/axios';
import { useToastStore } from '@/components/ui/Toast';

function PodcastDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const addToast = useToastStore((s) => s.addToast);

  const { data: podcast, isLoading } = useSWR<Podcast>(
    id ? `/podcasts/${id}` : null,
    fetcher
  );

  if (isLoading || !podcast) return <PodcastDetailSkeleton />;

  const isCreator = podcast.id_user === user?.id_user;

  const isFollowing =
    user?.followed_podcasts?.some((p) => p.id_podcast === podcast.id_podcast) ||
    false;

  const handleFollow = async () => {
    if (!user) return;
    try {
      await api.post(`/users/${user.id_user}/follow-podcast`, {
        podcast_id: podcast.id_podcast,
      });
      await refreshUser();
      addToast('Successfully followed podcast', 'success');
    } catch (e) {
      console.error('Failed to follow podcast', e);
      addToast('Failed to follow podcast', 'error');
      throw e;
    }
  };

  const handleUnfollow = async () => {
    if (!user) return;
    try {
      await api.post(
        `/users/${user.id_user}/unfollow-podcast/${podcast.id_podcast}`,
        { _method: 'DELETE' }
      );
      await refreshUser();
      addToast('Unfollowed podcast successfully', 'success');
    } catch (e) {
      console.error('Failed to unfollow podcast', e);
      addToast('Failed to unfollow podcast', 'error');
      throw e;
    }
  };

  return (
    <>
      <Head>
        <title>{podcast.name} — Spotify Clone</title>
      </Head>

      <div className="-mt-[60px]">
        {/* Banner */}
        <div
          className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 px-4 sm:px-8 pt-20 sm:pt-24 pb-6 sm:pb-8"
          style={{
            background:
              'linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), linear-gradient(135deg, #065f46 0%, #134e4a 50%, #0f172a 100%)',
            minHeight: '340px',
          }}
        >
          {/* Cover */}
          <div className="w-36 h-36 sm:w-48 md:w-56 sm:h-48 md:h-56 shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
            {podcast.cover_image ? (
              <img
                src={podcast.cover_image}
                alt={podcast.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-700 to-spotify-dark flex items-center justify-center">
                <Mic2 className="w-20 h-20 text-spotify-muted" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col items-center sm:items-start justify-end text-center sm:text-left">
            <p className="text-xs sm:text-sm font-bold uppercase text-white/80 mb-1">
              Podcast
            </p>
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-2 sm:mb-3 leading-tight">
              {podcast.name}
            </h1>
            {podcast.about && (
              <p className="text-sm text-white/70 max-w-lg mb-2 line-clamp-2">
                {podcast.about}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span className="font-bold text-white">
                {podcast.creator?.name || 'Unknown Creator'}
              </span>
              {podcast.category && (
                <>
                  <span className="mx-1">•</span>
                  <span>{podcast.category.name}</span>
                </>
              )}
              <span className="mx-1">•</span>
              <span>{podcast.episodes?.length || 0} episodes</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          <div
            className="absolute inset-0 h-40"
            style={{
              background: 'linear-gradient(rgba(6,95,70,.3), #121212)',
            }}
          />

          <div className="relative z-10 px-4 sm:px-8 py-6">
            {/* Actions */}
            <div className="flex items-center gap-4 mb-8">
              <FollowButton
                key={`${podcast.id_podcast}-${isFollowing}`}
                isFollowing={isFollowing}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                size="md"
              />
              {isCreator && (
                <Link
                  href={`/podcast/${id}/episode/create`}
                  className="btn-outline text-sm py-1.5 px-6"
                >
                  + Add Episode
                </Link>
              )}
            </div>

            {/* Episodes */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-5">
                All Episodes
              </h2>
              {podcast.episodes && podcast.episodes.length > 0 ? (
                <div className="space-y-1">
                  {podcast.episodes.map((episode) => (
                    <EpisodeRow key={episode.id_episode} episode={episode} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[20vh]">
                  <Mic2 className="w-12 h-12 text-spotify-muted/30 mb-3" />
                  <p className="text-sm text-spotify-muted">
                    No episodes yet.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(PodcastDetailPage);
