import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';
import { ArrowLeft, Mic2 } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { BannerSkeleton } from '@/components/ui/SkeletonCard';
import PodcastCard from '@/components/podcast/PodcastCard';
import type { PodcastCategory, Podcast } from '@/types';

interface PodcastCategoryWithPodcasts extends PodcastCategory {
  podcasts?: Podcast[];
}

export default function PodcastGenreDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: category, isLoading } = useSWR<PodcastCategoryWithPodcasts>(
    id ? `/podcast-categories/${id}` : null,
    fetcher
  );

  if (isLoading || !category) return <BannerSkeleton />;

  const podcasts = category.podcasts || [];

  return (
    <>
      <Head>
        <title>{category.name} — Spotify Clone</title>
        <meta name="description" content={`Browse ${category.name} podcasts`} />
      </Head>

      <div className="-mt-[60px]">
        {/* Hero Banner */}
        <div
          className="relative px-4 sm:px-8 pt-20 pb-8 sm:pb-12"
          style={{
            background: category.cover_image
              ? `linear-gradient(transparent 0%, rgba(18,18,18,0.8) 70%, #121212 100%), url(${category.cover_image}) center/cover no-repeat`
              : 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 50%, #121212 100%)',
            minHeight: '340px',
          }}
        >
          {/* Back button */}
          <button
            onClick={() => router.push('/genres')}
            className="absolute top-20 left-4 sm:left-8 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-20"
            aria-label="Back to genres"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>

          {/* Genre Info */}
          <div className="flex flex-col justify-end h-full min-h-[180px] sm:min-h-[220px] relative z-10">
            <p className="text-xs sm:text-sm font-bold uppercase text-white/70 mb-2 tracking-widest">
              Podcast Genre
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-2 leading-[0.95] drop-shadow-2xl">
              {category.name}
            </h1>
            <p className="text-sm text-white/70">
              {podcasts.length} podcast{podcasts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Gradient fade to page background */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-spotify-black to-transparent pointer-events-none" />
        </div>

        {/* Podcast Grid */}
        <div className="relative px-4 sm:px-8 pt-6 pb-8">
          {/* Gradient continuation */}
          <div
            className="absolute inset-0 h-40 pointer-events-none"
            style={{ background: 'linear-gradient(rgba(109,40,217,0.15), transparent)' }}
          />

          <div className="relative z-10">
            {podcasts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                {podcasts.map((podcast) => (
                  <PodcastCard key={podcast.id_podcast} podcast={podcast} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[30vh]">
                <Mic2 className="w-16 h-16 text-spotify-muted/30 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No podcasts yet</h2>
                <p className="text-sm text-spotify-muted mb-4">
                  There are no podcasts in this genre yet.
                </p>
                <Link
                  href="/genres"
                  className="flex items-center gap-2 text-sm text-spotify-green hover:text-spotify-green-bright transition-colors font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Genres
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
