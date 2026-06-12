import Head from 'next/head';
import useSWR from 'swr';
import { useState } from 'react';
import { Radio } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { withAuth } from '@/utils/withAuth';
import PodcastCard from '@/components/podcast/PodcastCard';
import { GridSkeleton } from '@/components/ui/SkeletonCard';
import type { Podcast, PodcastCategory } from '@/types';
import Link from 'next/link';

function PodcastListPage() {
  const { data: podcasts, isLoading } = useSWR<Podcast[]>('/podcasts', fetcher);
  const { data: categories } = useSWR<PodcastCategory[]>(
    '/podcast-categories',
    fetcher
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  if (isLoading) return (
    <div className="px-4 sm:px-6 pb-8">
      <div className="mb-6 pt-4">
        <div className="h-8 w-32 bg-spotify-card/80 rounded animate-pulse" />
      </div>
      <GridSkeleton count={12} />
    </div>
  );

  const filteredPodcasts = selectedCategory
    ? podcasts?.filter((p) => p.id_podcast_category === selectedCategory)
    : podcasts;

  return (
    <>
      <Head>
        <title>Podcasts — Spotify Clone</title>
      </Head>

      <div className="px-4 sm:px-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <h1 className="text-3xl font-bold text-white">Podcasts</h1>
          <Link
            href="/podcast/create"
            className="btn-spotify text-sm py-2 px-6"
          >
            Create Podcast
          </Link>
        </div>

        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-white text-black'
                  : 'bg-spotify-card text-white hover:bg-spotify-hover'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id_podcast_category}
                onClick={() => setSelectedCategory(cat.id_podcast_category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id_podcast_category
                    ? 'bg-white text-black'
                    : 'bg-spotify-card text-white hover:bg-spotify-hover'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Podcast Grid */}
        {filteredPodcasts && filteredPodcasts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredPodcasts.map((podcast) => (
              <PodcastCard key={podcast.id_podcast} podcast={podcast} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Radio className="w-16 h-16 text-spotify-muted/30 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              No podcasts found
            </h2>
            <p className="text-sm text-spotify-muted">
              Be the first to create a podcast!
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default withAuth(PodcastListPage);
