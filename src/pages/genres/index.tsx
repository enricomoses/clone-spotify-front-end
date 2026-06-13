import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';
import { Music, Mic2, LayoutGrid } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import type { PlaylistCategory, PodcastCategory } from '@/types';

// Vibrant color palette for genre cards — inspired by Spotify's genre page
const GENRE_COLORS = [
  'from-rose-600 to-pink-500',
  'from-violet-600 to-purple-500',
  'from-blue-600 to-cyan-500',
  'from-emerald-600 to-teal-500',
  'from-amber-600 to-orange-500',
  'from-indigo-600 to-blue-500',
  'from-fuchsia-600 to-pink-400',
  'from-sky-600 to-blue-400',
  'from-lime-600 to-green-500',
  'from-red-600 to-rose-500',
  'from-teal-600 to-cyan-400',
  'from-orange-600 to-yellow-500',
  'from-purple-700 to-violet-400',
  'from-pink-600 to-rose-400',
  'from-cyan-600 to-sky-400',
  'from-green-700 to-emerald-400',
];

// Solid background colors for cards (hex for inline styles)
const GENRE_BG_COLORS = [
  '#E13300', '#8D67AB', '#1E3264', '#477D95',
  '#E8115B', '#608108', '#E1118B', '#148A08',
  '#509BF5', '#BA5D07', '#D84000', '#8C67AB',
  '#1E3264', '#E61E32', '#0D73EC', '#537AA1',
];

function getGradient(index: number): string {
  return GENRE_COLORS[index % GENRE_COLORS.length];
}

function getBgColor(index: number): string {
  return GENRE_BG_COLORS[index % GENRE_BG_COLORS.length];
}

// Skeleton loader for genre cards
function GenreCardSkeleton() {
  return (
    <div className="relative aspect-[16/10] rounded-lg overflow-hidden animate-pulse bg-spotify-card/60" />
  );
}

export default function GenresPage() {
  const { data: playlistCategories, isLoading: loadingPlaylists } = useSWR<PlaylistCategory[]>(
    '/playlist-categories',
    fetcher
  );
  const { data: podcastCategories, isLoading: loadingPodcasts } = useSWR<PodcastCategory[]>(
    '/podcast-categories',
    fetcher
  );

  const isLoading = loadingPlaylists || loadingPodcasts;

  return (
    <>
      <Head>
        <title>Browse Genres — Spotify Clone</title>
        <meta name="description" content="Browse all music and podcast genres" />
      </Head>

      <div className="px-4 sm:px-6 pb-8">
        {/* Page Header */}
        <div className="mb-8 pt-4">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-spotify-green" />
            Browse All
          </h1>
          <p className="text-sm text-spotify-muted mt-1">
            Explore genres and categories
          </p>
        </div>

        {/* Genre (Playlist Categories) */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <Music className="w-5 h-5 text-spotify-green" />
            Genre
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <GenreCardSkeleton key={i} />
              ))}
            </div>
          ) : playlistCategories && playlistCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {playlistCategories.map((category, index) => (
                <Link
                  key={category.id_playlist_category}
                  href={`/genres/playlist/${category.id_playlist_category}`}
                  className="genre-card group relative aspect-[16/10] rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/40"
                  style={{ backgroundColor: getBgColor(index) }}
                  id={`genre-playlist-${category.id_playlist_category}`}
                >
                  {/* Card content */}
                  <div className="relative z-10 h-full p-4 flex flex-col justify-between">
                    <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight drop-shadow-lg">
                      {category.name}
                    </h3>
                  </div>

                  {/* Icon image — positioned at bottom right with rotation */}
                  {category.icon ? (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="absolute -bottom-1 -right-3 w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-md shadow-xl rotate-[25deg] transition-transform duration-500 group-hover:rotate-[15deg] group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute -bottom-1 -right-3 w-24 h-24 sm:w-28 sm:h-28 rounded-md bg-black/20 flex items-center justify-center rotate-[25deg]">
                      <Music className="w-10 h-10 text-white/40" />
                    </div>
                  )}

                  {/* Subtle gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/30 pointer-events-none" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Music className="w-12 h-12 text-spotify-muted/30 mb-3" />
              <p className="text-sm text-spotify-muted">No genres available yet</p>
            </div>
          )}
        </section>

        {/* Genre Podcast */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-spotify-green" />
            Genre Podcast
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <GenreCardSkeleton key={i} />
              ))}
            </div>
          ) : podcastCategories && podcastCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {podcastCategories.map((category, index) => (
                <Link
                  key={category.id_podcast_category}
                  href={`/genres/podcast/${category.id_podcast_category}`}
                  className="genre-card group relative aspect-[16/10] rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/40"
                  style={{ backgroundColor: getBgColor(index + 8) }}
                  id={`genre-podcast-${category.id_podcast_category}`}
                >
                  {/* Card content */}
                  <div className="relative z-10 h-full p-4 flex flex-col justify-between">
                    <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight drop-shadow-lg">
                      {category.name}
                    </h3>
                  </div>

                  {/* Icon image — positioned at bottom right with rotation */}
                  {category.icon ? (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="absolute -bottom-1 -right-3 w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-md shadow-xl rotate-[25deg] transition-transform duration-500 group-hover:rotate-[15deg] group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute -bottom-1 -right-3 w-24 h-24 sm:w-28 sm:h-28 rounded-md bg-black/20 flex items-center justify-center rotate-[25deg]">
                      <Mic2 className="w-10 h-10 text-white/40" />
                    </div>
                  )}

                  {/* Subtle gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/30 pointer-events-none" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Mic2 className="w-12 h-12 text-spotify-muted/30 mb-3" />
              <p className="text-sm text-spotify-muted">No podcast genres available yet</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
