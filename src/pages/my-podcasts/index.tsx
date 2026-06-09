import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { Mic, Plus, Edit3, Trash2, Eye, Loader2 } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { withAuth } from '@/utils/withAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { PageLoading } from '@/components/ui/Spinner';
import type { Podcast } from '@/types';
import api from '@/lib/axios';

function MyPodcastsPage() {
  const user = useAuthStore((s) => s.user);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: allPodcasts, isLoading } = useSWR<Podcast[]>('/podcasts', fetcher);

  // Filter podcasts owned by current user
  const myPodcasts = allPodcasts?.filter((p) => p.id_user === user?.id_user) || [];

  const handleDelete = async (podcastId: string) => {
    if (!confirm('Hapus podcast ini? Semua episode juga akan terhapus.')) return;
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
    } catch (e) {
      console.error('Failed to delete podcast', e);
      alert('Gagal menghapus podcast.');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <PageLoading />;

  return (
    <>
      <Head>
        <title>Podcast Saya — Spotify Clone</title>
        <meta name="description" content="Kelola podcast yang kamu buat" />
      </Head>

      <div className="px-6 pb-8">
        <div className="flex items-center justify-between mb-8 pt-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Mic className="w-8 h-8 text-spotify-green" />
              Podcast Saya
            </h1>
            <p className="text-sm text-spotify-muted mt-1">
              Kelola semua podcast yang kamu buat
            </p>
          </div>
          <Link
            href="/my-podcasts/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-spotify-green text-black text-sm font-bold rounded-full hover:bg-spotify-green-bright transition-colors"
          >
            <Plus className="w-4 h-4" />
            Buat Podcast Baru
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
                        {podcast.episodes?.length || 0} episode
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
                  <Link
                    href={`/podcast/${podcast.id_podcast}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(podcast.id_podcast)}
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
              Belum ada podcast
            </h2>
            <p className="text-sm text-spotify-muted mb-6">
              Mulai buat podcast pertamamu dan bagikan ke dunia!
            </p>
            <Link
              href="/my-podcasts/create"
              className="px-6 py-3 bg-spotify-green text-black font-bold rounded-full hover:bg-spotify-green-bright transition-colors"
            >
              Buat Podcast Baru
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default withAuth(MyPodcastsPage);
