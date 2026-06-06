import { useState, useMemo } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import { Search as SearchIcon } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { withAuth } from '@/utils/withAuth';
import SongRow from '@/components/song/SongRow';
import ArtistCard from '@/components/artist/ArtistCard';
import { PageLoading } from '@/components/ui/Spinner';
import type { Song, Artist } from '@/types';
import { useEffect, useRef } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<NodeJS.Timeout>();

  const { data: songs, isLoading: songsLoading } = useSWR<Song[]>('/songs', fetcher);
  const { data: artists, isLoading: artistsLoading } = useSWR<Artist[]>('/artists', fetcher);

  // Debounce search
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Filter results
  const filteredSongs = useMemo(() => {
    if (!debouncedQuery || !songs) return [];
    const q = debouncedQuery.toLowerCase();
    return songs.filter((s) => s.title.toLowerCase().includes(q));
  }, [debouncedQuery, songs]);

  const filteredArtists = useMemo(() => {
    if (!debouncedQuery || !artists) return [];
    const q = debouncedQuery.toLowerCase();
    return artists.filter((a) => a.name.toLowerCase().includes(q));
  }, [debouncedQuery, artists]);

  const isLoading = songsLoading || artistsLoading;
  const hasResults = filteredSongs.length > 0 || filteredArtists.length > 0;

  return (
    <>
      <Head>
        <title>Search — Spotify Clone</title>
      </Head>

      <div className="px-6 pb-8">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 pt-4 pb-6 bg-spotify-black">
          <div className="relative max-w-lg">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-spotify-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to listen to?"
              className="w-full bg-spotify-card rounded-full pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              autoFocus
            />
          </div>
        </div>

        {isLoading && <PageLoading />}

        {/* No query state */}
        {!debouncedQuery && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <SearchIcon className="w-16 h-16 text-spotify-muted/30 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Search Spotify</h2>
            <p className="text-sm text-spotify-muted">
              Find your favorite songs and artists
            </p>
          </div>
        )}

        {/* No results */}
        {debouncedQuery && !hasResults && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <h2 className="text-xl font-bold text-white mb-2">
              No results found for &quot;{debouncedQuery}&quot;
            </h2>
            <p className="text-sm text-spotify-muted">
              Please make sure your words are spelled correctly, or use fewer or different keywords.
            </p>
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <div className="space-y-10">
            {/* Artists */}
            {filteredArtists.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-5">Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredArtists.slice(0, 6).map((artist) => (
                    <ArtistCard key={artist.id_artist} artist={artist} />
                  ))}
                </div>
              </section>
            )}

            {/* Songs */}
            {filteredSongs.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-5">Songs</h2>
                <div className="max-w-4xl">
                  {filteredSongs.slice(0, 20).map((song, idx) => (
                    <SongRow
                      key={song.id_song}
                      song={song}
                      index={idx}
                      queue={filteredSongs}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default withAuth(SearchPage);
