import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { Mic, Plus, Edit3, Trash2, Eye, Loader2 } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { withAuth } from '@/utils/withAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import EditPodcastModal from '@/components/podcast/EditPodcastModal';
import type { Podcast } from '@/types';
import api from '@/lib/axios';

function MyPodcastsPage() {
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<Podcast | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // Edit modal state
  const [editTarget, setEditTarget] = useState<Podcast | null>(null);

  const { data: allPodcasts, isLoading } = useSWR<Podcast[]>('/podcasts', fetcher);

  // Filter podcasts owned by current user
  const myPodcasts = allPodcasts?.filter((p) => p.id_user === user?.id_user) || [];

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const podcastId = deleteTarget.id_podcast;
    setIsDeleteLoading(true);
    setDeletingId(podcastId);
    try {
      const podcast = myPodcasts.find((p) => p.id_podcast === podcastId);
      if (podcast) {
        if (podcast.cover_image) {
          try {
            await api.post('/media/delete', {
              image_url: podcast.cover_image,
              _method: 'DELETE',
            });
          } catch (err) {
            console.warn('Failed to delete podcast cover image from Cloudinary:', err);
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
      }

      await api.post(`/podcasts/${podcastId}`, { _method: 'DELETE' });
      mutate('/podcasts');
      addToast('Podcast deleted successfully!', 'success');
      setDeleteTarget(null);
    } catch (e: any) {
      console.error('Failed to delete podcast', e);
      addToast(e.response?.data?.message || 'Failed to delete podcast.', 'error');
    } finally {
      setDeletingId(null);
      setIsDeleteLoading(false);
    }
  };

  const handleEditSuccess = () => {
    mutate('/podcasts');
    addToast('Podcast updated successfully!', 'success');
  };

  if (isLoading) return (
    <div className="px-6 pb-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <div>
          <div className="flex items-center gap-3">
            <Mic className="w-8 h-8 text-spotify-muted animate-pulse" />
            <div className="h-8 w-44 bg-spotify-card/80 rounded animate-pulse" />
          </div>
          <div className="h-4 w-60 bg-spotify-card/80 rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-44 bg-spotify-card/80 rounded-full animate-pulse" />
      </div>

      {/* Grid of My Podcasts Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-spotify-card/30 border border-spotify-border/10 rounded-xl p-5"
          >
            {/* Top section skeleton */}
            <div className="flex items-start gap-4 mb-4">
              {/* Cover Skeleton */}
              <div className="w-20 h-20 rounded-lg bg-spotify-card/80 animate-pulse shrink-0" />
              {/* Info Skeleton */}
              <div className="flex-1 min-w-0">
                <div className="h-5 w-1/2 bg-spotify-card/80 rounded animate-pulse mb-2" />
                <div className="h-3.5 w-3/4 bg-spotify-card/80 rounded animate-pulse mb-1.5" />
                <div className="h-3 w-1/2 bg-spotify-card/80 rounded animate-pulse mb-3" />
                <div className="flex items-center gap-3">
                  <div className="h-4 w-14 bg-spotify-card/80 rounded-full animate-pulse" />
                  <div className="h-4 w-16 bg-spotify-card/80 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Bottom Actions skeleton */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-8 bg-spotify-card/80 rounded-lg animate-pulse" />
              <div className="w-8 h-8 bg-spotify-card/80 rounded-lg animate-pulse" />
              <div className="w-8 h-8 bg-spotify-card/80 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>My Podcasts — Spotify Clone</title>
        <meta name="description" content="Manage podcasts you created" />
      </Head>

      <div className="px-6 pb-8">
        <div className="flex items-center justify-between mb-8 pt-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Mic className="w-8 h-8 text-spotify-green" />
              My Podcasts
            </h1>
            <p className="text-sm text-spotify-muted mt-1">
              Manage all podcasts you created
            </p>
          </div>
          <Link
            href="/my-podcasts/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-spotify-green text-black text-sm font-bold rounded-full hover:bg-spotify-green-bright transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Podcast
          </Link>
        </div>

        {myPodcasts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPodcasts.map((podcast) => (
              <div
                key={podcast.id_podcast}
                className="bg-spotify-card/50 border border-spotify-border/20 rounded-xl p-5 hover:bg-spotify-card transition-colors"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 rounded-lg bg-spotify-card overflow-hidden shrink-0">
                    {podcast.cover_image ? (
                      <img
                        src={podcast.cover_image}
                        alt={podcast.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-600 to-spotify-dark flex items-center justify-center">
                        <Mic className="w-8 h-8 text-white/60" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white truncate">
                      {podcast.name}
                    </h3>
                    {podcast.about && (
                      <p className="text-xs text-spotify-muted line-clamp-2 mt-1">
                        {podcast.about}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-spotify-muted bg-white/10 px-2 py-0.5 rounded-full">
                        {podcast.episodes?.length || 0} episodes
                      </span>
                      {podcast.category && (
                        <span className="text-[10px] text-spotify-green bg-spotify-green/10 px-2 py-0.5 rounded-full">
                          {podcast.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/my-podcasts/${podcast.id_podcast}/episodes`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Episodes
                  </Link>
                  <button
                    onClick={() => setEditTarget(podcast)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(podcast)}
                    disabled={deletingId === podcast.id_podcast}
                    className="flex items-center justify-center px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs font-medium text-red-400 transition-colors disabled:opacity-50"
                  >
                    {deletingId === podcast.id_podcast ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Mic className="w-16 h-16 text-spotify-muted/30 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              No podcasts yet
            </h2>
            <p className="text-sm text-spotify-muted mb-6">
              Create your first podcast and share it with the world!
            </p>
            <Link
              href="/my-podcasts/create"
              className="px-6 py-3 bg-spotify-green text-black font-bold rounded-full hover:bg-spotify-green-bright transition-colors"
            >
              Create New Podcast
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Podcast"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? All episodes will also be deleted. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleteLoading}
      />

      {/* Edit Podcast Modal */}
      {editTarget && (
        <EditPodcastModal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          podcast={editTarget}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}

export default withAuth(MyPodcastsPage);
