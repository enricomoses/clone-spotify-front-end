import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR, { mutate } from 'swr';
import { Mic2, Edit3, Trash2 } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { withAuth } from '@/utils/withAuth';
import FollowButton from '@/components/social/FollowButton';
import EpisodeRow from '@/components/podcast/EpisodeRow';
import { PodcastDetailSkeleton } from '@/components/ui/SkeletonCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import EditPodcastModal from '@/components/podcast/EditPodcastModal';
import EditEpisodeModal from '@/components/podcast/EditEpisodeModal';
import type { Podcast, Episode } from '@/types';
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

  // Edit podcast modal state
  const [showEditPodcast, setShowEditPodcast] = useState(false);

  // Delete podcast modal state
  const [showDeletePodcast, setShowDeletePodcast] = useState(false);
  const [isDeletingPodcast, setIsDeletingPodcast] = useState(false);

  // Edit episode modal state
  const [editEpisode, setEditEpisode] = useState<Episode | null>(null);

  // Delete episode modal state
  const [deleteEpisode, setDeleteEpisode] = useState<Episode | null>(null);
  const [isDeletingEpisode, setIsDeletingEpisode] = useState(false);
  const [deletingEpisodeId, setDeletingEpisodeId] = useState<string | null>(null);

  const { data: podcast, isLoading } = useSWR<Podcast>(
    id ? `/podcasts/${id}` : null,
    fetcher
  );

  // Refresh logged-in user profile on mount to sync followed podcasts
  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, [id, user?.id_user]);

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

  // --- Podcast CRUD handlers ---
  const handleEditPodcastSuccess = () => {
    mutate(`/podcasts/${id}`);
    mutate('/podcasts');
    addToast('Podcast updated successfully!', 'success');
  };

  const handleDeletePodcastConfirm = async () => {
    setIsDeletingPodcast(true);
    try {
      // Clean up Cloudinary assets
      if (podcast.cover_image) {
        try {
          await api.post('/media/delete', {
            image_url: podcast.cover_image,
            _method: 'DELETE',
          });
        } catch (err) {
          console.warn('Failed to delete podcast cover from Cloudinary:', err);
        }
      }
      if (podcast.episodes && podcast.episodes.length > 0) {
        for (const ep of podcast.episodes) {
          if (ep.thumbnail_image) {
            try {
              await api.post('/media/delete', {
                image_url: ep.thumbnail_image,
                _method: 'DELETE',
              });
            } catch (err) {
              console.warn('Failed to delete episode thumbnail from Cloudinary:', err);
            }
          }
        }
      }

      await api.post(`/podcasts/${podcast.id_podcast}`, { _method: 'DELETE' });
      mutate('/podcasts');
      addToast('Podcast deleted successfully!', 'success');
      router.push('/my-podcasts');
    } catch (e: any) {
      console.error('Failed to delete podcast', e);
      addToast(e.response?.data?.message || 'Failed to delete podcast.', 'error');
    } finally {
      setIsDeletingPodcast(false);
      setShowDeletePodcast(false);
    }
  };

  // --- Episode CRUD handlers ---
  const handleEditEpisodeSuccess = () => {
    mutate(`/podcasts/${id}`);
    addToast('Episode updated successfully!', 'success');
  };

  const handleDeleteEpisodeConfirm = async () => {
    if (!deleteEpisode) return;
    const episodeId = deleteEpisode.id_episode;
    setIsDeletingEpisode(true);
    setDeletingEpisodeId(episodeId);

    try {
      // Clean up Cloudinary assets
      if (deleteEpisode.thumbnail_image) {
        try {
          await api.post('/media/delete', {
            image_url: deleteEpisode.thumbnail_image,
            _method: 'DELETE',
          });
        } catch (err) {
          console.warn('Failed to delete episode thumbnail from Cloudinary:', err);
        }
      }
      if (deleteEpisode.video_url) {
        try {
          await api.post('/media/video/delete', {
            video_url: deleteEpisode.video_url,
            _method: 'DELETE',
          });
        } catch (e) {
          console.warn('Failed to delete episode video from Cloudinary:', e);
        }
      }
      if (deleteEpisode.audio_url && deleteEpisode.audio_url !== deleteEpisode.video_url) {
        try {
          await api.post('/media/audio/delete', {
            audio_url: deleteEpisode.audio_url,
            _method: 'DELETE',
          });
        } catch (e) {
          console.warn('Failed to delete episode audio from Cloudinary:', e);
        }
      }

      await api.post(`/episodes/${episodeId}`, {
        _method: 'DELETE',
        id_user: user?.id_user,
      });
      mutate(`/podcasts/${id}`);
      addToast('Episode deleted successfully!', 'success');
      setDeleteEpisode(null);
    } catch (e: any) {
      console.error('Failed to delete episode', e);
      addToast(e.response?.data?.message || 'Failed to delete episode.', 'error');
    } finally {
      setIsDeletingEpisode(false);
      setDeletingEpisodeId(null);
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
              <Link
                href={`/profile/${podcast.id_user}`}
                className="font-bold text-white hover:underline transition-colors"
              >
                {podcast.creator?.name || 'Unknown Creator'}
              </Link>
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
                <>
                  <Link
                    href={`/podcast/${id}/episode/create`}
                    className="btn-outline text-sm py-1.5 px-6"
                  >
                    + Add Episode
                  </Link>
                  <button
                    onClick={() => setShowEditPodcast(true)}
                    className="flex items-center gap-1.5 text-sm py-1.5 px-5 text-white border border-spotify-border rounded-full hover:border-white hover:bg-white/5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeletePodcast(true)}
                    className="flex items-center gap-1.5 text-sm py-1.5 px-5 text-red-400 border border-red-500/30 rounded-full hover:border-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </>
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
                    <EpisodeRow
                      key={episode.id_episode}
                      episode={episode}
                      isCreator={isCreator}
                      onEdit={(ep) => setEditEpisode(ep)}
                      onDelete={(ep) => setDeleteEpisode(ep)}
                      isDeleting={deletingEpisodeId === episode.id_episode}
                    />
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

      {/* Edit Podcast Modal */}
      {showEditPodcast && (
        <EditPodcastModal
          isOpen={showEditPodcast}
          onClose={() => setShowEditPodcast(false)}
          podcast={podcast}
          onSuccess={handleEditPodcastSuccess}
        />
      )}

      {/* Delete Podcast Confirmation */}
      <ConfirmDialog
        isOpen={showDeletePodcast}
        onClose={() => setShowDeletePodcast(false)}
        onConfirm={handleDeletePodcastConfirm}
        title="Delete Podcast"
        description={`Are you sure you want to delete "${podcast.name}"? All episodes will also be deleted. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeletingPodcast}
      />

      {/* Edit Episode Modal */}
      {editEpisode && (
        <EditEpisodeModal
          isOpen={!!editEpisode}
          onClose={() => setEditEpisode(null)}
          episode={editEpisode}
          onSuccess={handleEditEpisodeSuccess}
          userId={user?.id_user}
        />
      )}

      {/* Delete Episode Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteEpisode}
        onClose={() => setDeleteEpisode(null)}
        onConfirm={handleDeleteEpisodeConfirm}
        title="Delete Episode"
        description={`Are you sure you want to delete "${deleteEpisode?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeletingEpisode}
      />
    </>
  );
}

export default withAuth(PodcastDetailPage);
