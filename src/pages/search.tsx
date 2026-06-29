import { useState, useMemo, useEffect, useRef } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import { Search as SearchIcon } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import SongRow from '@/components/song/SongRow';
import ArtistCard from '@/components/artist/ArtistCard';
import AlbumCard from '@/components/album/AlbumCard';
import PlaylistCard from '@/components/playlist/PlaylistCard';
import PodcastCard from '@/components/podcast/PodcastCard';
import UserCard from '@/components/social/UserCard';
import { GridSkeleton, SongRowSkeleton, ArtistCardSkeleton } from '@/components/ui/SkeletonCard';
import type { Song, Artist, Album, Playlist, Podcast, User } from '@/types';
import { cn } from '@/lib/utils';

type TabKey = 'all' | 'songs' | 'artists' | 'albums' | 'playlists' | 'podcasts' | 'users';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'songs', label: 'Songs' },
  { key: 'artists', label: 'Artists' },
  { key: 'albums', label: 'Albums' },
  { key: 'playlists', label: 'Playlists' },
  { key: 'podcasts', label: 'Podcasts' },
  { key: 'users', label: 'Users' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const debounceRef = useRef<NodeJS.Timeout>();
  const currentUser = useAuthStore((s) => s.user);

  const { data: songs, isLoading: songsLoading } = useSWR<Song[]>('/songs', fetcher);
  const { data: artists, isLoading: artistsLoading } = useSWR<Artist[]>('/artists', fetcher);
  const { data: albums } = useSWR<Album[]>('/albums', fetcher);
  const { data: playlists } = useSWR<Playlist[]>('/playlists', fetcher);
  const { data: podcasts } = useSWR<Podcast[]>('/podcasts', fetcher);

  // Fetch users list for client-side search
  const { data: allUsers, isLoading: usersLoading, mutate: mutateUsers } = useSWR<User[]>('/users', fetcher);

  // Debounce search — 400ms
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Filter results
  const filteredSongs = useMemo(() => {
    if (!debouncedQuery || !songs) return [];
    const q = debouncedQuery.toLowerCase();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artists?.some((a) => a.name.toLowerCase().includes(q))
    );
  }, [debouncedQuery, songs]);

  const filteredArtists = useMemo(() => {
    if (!debouncedQuery || !artists) return [];
    const q = debouncedQuery.toLowerCase();
    return artists.filter((a) => a.name.toLowerCase().includes(q));
  }, [debouncedQuery, artists]);

  const filteredAlbums = useMemo(() => {
    if (!debouncedQuery || !albums) return [];
    const q = debouncedQuery.toLowerCase();
    return albums.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.artists?.some((ar) => ar.name.toLowerCase().includes(q))
    );
  }, [debouncedQuery, albums]);

  const filteredPlaylists = useMemo(() => {
    if (!debouncedQuery || !playlists) return [];
    const q = debouncedQuery.toLowerCase();
    return playlists.filter((p) => p.name.toLowerCase().includes(q));
  }, [debouncedQuery, playlists]);

  const filteredPodcasts = useMemo(() => {
    if (!debouncedQuery || !podcasts) return [];
    const q = debouncedQuery.toLowerCase();
    return podcasts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.about?.toLowerCase().includes(q)
    );
  }, [debouncedQuery, podcasts]);

  // Filter users in memory (case-insensitive)
  const filteredUsers = useMemo(() => {
    if (!debouncedQuery || !allUsers) return [];
    const q = debouncedQuery.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) &&
        u.id_user !== currentUser?.id_user
    );
  }, [debouncedQuery, allUsers, currentUser]);

  const isLoading = songsLoading || artistsLoading;
  const hasResults =
    filteredSongs.length > 0 ||
    filteredArtists.length > 0 ||
    filteredAlbums.length > 0 ||
    filteredPlaylists.length > 0 ||
    filteredPodcasts.length > 0 ||
    filteredUsers.length > 0;

  const showSongs = (activeTab === 'all' || activeTab === 'songs') && filteredSongs.length > 0;
  const showArtists = (activeTab === 'all' || activeTab === 'artists') && filteredArtists.length > 0;
  const showAlbums = (activeTab === 'all' || activeTab === 'albums') && filteredAlbums.length > 0;
  const showPlaylists = (activeTab === 'all' || activeTab === 'playlists') && filteredPlaylists.length > 0;
  const showPodcasts = (activeTab === 'all' || activeTab === 'podcasts') && filteredPodcasts.length > 0;
  const showUsers = (activeTab === 'all' || activeTab === 'users') && filteredUsers.length > 0;



  return (
    <>
      <Head>
        <title>Search — Spotify Clone</title>
        <meta name="description" content="Search for songs, artists, albums, playlists, podcasts, and users" />
      </Head>

      <div className="px-4 sm:px-6 pb-8">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 pt-4 pb-4 bg-spotify-black">
          <div className="relative max-w-lg">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-spotify-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to listen to?"
              className="w-full bg-spotify-card rounded-full pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              autoFocus
              id="search-input"
            />
          </div>

          {/* Filter Tabs */}
          {debouncedQuery && (
            <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                    activeTab === tab.key
                      ? 'bg-white text-black'
                      : 'bg-spotify-card text-white hover:bg-spotify-hover'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="space-y-8 mt-4">
            <div>
              <div className="h-7 w-32 bg-spotify-card/80 rounded animate-pulse mb-5" />
              <GridSkeleton count={6} type="artist" />
            </div>
            <div>
              <div className="h-7 w-24 bg-spotify-card/80 rounded animate-pulse mb-5" />
              {Array.from({ length: 5 }).map((_, i) => <SongRowSkeleton key={i} />)}
            </div>
          </div>
        )}

        {/* No query state */}
        {!debouncedQuery && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <SearchIcon className="w-16 h-16 text-spotify-muted/30 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Search Spotify</h2>
            <p className="text-sm text-spotify-muted">
              Find your favorite songs, artists, albums, playlists, podcasts, and users
            </p>
          </div>
        )}

        {/* No results */}
        {debouncedQuery && !hasResults && !isLoading && !usersLoading && (
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
        {(hasResults || usersLoading) && (
          <div className="space-y-10 mt-4">
            {/* Users */}
            {showUsers && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-5">Users</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredUsers.slice(0, activeTab === 'all' ? 6 : undefined).map((user) => (
                    <UserCard
                      key={user.id_user}
                      user={user}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Users loading skeleton */}
            {usersLoading && (activeTab === 'all' || activeTab === 'users') && (
              <section>
                <div className="h-7 w-20 bg-spotify-card/80 rounded animate-pulse mb-5" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ArtistCardSkeleton key={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Artists */}
            {showArtists && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-5">Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredArtists.slice(0, activeTab === 'all' ? 6 : undefined).map((artist) => (
                    <ArtistCard key={artist.id_artist} artist={artist} />
                  ))}
                </div>
              </section>
            )}

            {/* Songs */}
            {showSongs && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-5">Songs</h2>
                <div className="max-w-4xl">
                  {filteredSongs.slice(0, activeTab === 'all' ? 20 : undefined).map((song, idx) => (
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

            {/* Albums */}
            {showAlbums && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-5">Albums</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredAlbums.slice(0, activeTab === 'all' ? 6 : undefined).map((album) => (
                    <AlbumCard key={album.id_album} album={album} />
                  ))}
                </div>
              </section>
            )}

            {/* Playlists */}
            {showPlaylists && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-5">Playlists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredPlaylists.slice(0, activeTab === 'all' ? 6 : undefined).map((playlist) => (
                    <PlaylistCard key={playlist.id_playlist} playlist={playlist} />
                  ))}
                </div>
              </section>
            )}

            {/* Podcasts */}
            {showPodcasts && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-5">Podcasts</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredPodcasts.slice(0, activeTab === 'all' ? 6 : undefined).map((podcast) => (
                    <PodcastCard key={podcast.id_podcast} podcast={podcast} />
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
