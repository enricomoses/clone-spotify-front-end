import Head from 'next/head';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { getGreeting } from '@/utils/formatDuration';
import AlbumCard from '@/components/album/AlbumCard';
import ArtistCard from '@/components/artist/ArtistCard';
import PlaylistCard from '@/components/playlist/PlaylistCard';
import PodcastCard from '@/components/podcast/PodcastCard';
import { HomePageSkeleton } from '@/components/ui/SkeletonCard';
import type { Album, Artist, Playlist, Song, Podcast } from '@/types';
import Link from 'next/link';
import { Play, Sparkles } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const { requireAuth } = useRequireAuth();
  const playSong = usePlayerStore((s) => s.playSong);

  // Optimized: fetch only what the home page needs with limits applied server-side
  const { data: albums, isLoading: albumsLoading } = useSWR<Album[]>('/home/popular-albums?limit=12', fetcher);
  const { data: artists, isLoading: artistsLoading } = useSWR<Artist[]>('/home/popular-artists?limit=12', fetcher);
  const { data: playlists, isLoading: playlistsLoading } = useSWR<Playlist[]>('/home/featured-playlists?limit=12', fetcher);
  const { data: podcasts } = useSWR<Podcast[]>('/home/popular-podcasts?limit=6', fetcher);
  const { data: discoverSongs } = useSWR<Song[]>('/songs/discover-weekly', fetcher);

  // User-specific playlists — only fetch when logged in
  const { data: userPlaylists } = useSWR<Playlist[]>(
    user ? `/home/user-playlists?user_id=${user.id_user}&limit=6` : null,
    fetcher
  );

  const isLoading = albumsLoading || artistsLoading || playlistsLoading;

  if (isLoading) return <HomePageSkeleton />;

  return (
    <>
      <Head>
        <title>Home — Spotify Clone</title>
        <meta name="description" content="Discover new music, playlists, and podcasts on Spotify Clone" />
      </Head>

      <div className="px-4 sm:px-6 pb-8">
        {/* Greeting */}
        <div className="mb-6 sm:mb-8 pt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {user ? getGreeting() : 'Temukan musik favoritmu'}
          </h1>
          {!user && (
            <p className="text-sm text-spotify-muted mt-1">
              Browse lagu, artis, dan playlist tanpa login
            </p>
          )}
        </div>

        {/* Quick Play Grid — Top albums */}
        {albums && albums.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mb-8 sm:mb-10">
            {albums.slice(0, 6).map((album) => (
              <Link
                key={album.id_album}
                href={`/album/${album.id_album}`}
                className="flex items-center bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-colors group"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
                  {album.cover_image ? (
                    <img
                      src={album.cover_image}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-spotify-card" />
                  )}
                </div>
                <span className="px-3 sm:px-4 text-xs sm:text-sm font-bold text-white truncate">
                  {album.title}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Discover Weekly Preview */}
        {discoverSongs && discoverSongs.length > 0 && (
          <section className="mb-8 sm:mb-10">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">Discover Weekly</h2>
              </div>
              <Link
                href="/discover-weekly"
                className="text-xs uppercase font-bold text-spotify-muted hover:text-white tracking-wider transition-colors"
              >
                Show all
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {discoverSongs.slice(0, 5).map((song) => (
                <div
                  key={song.id_song}
                  className="bg-spotify-card/60 rounded-lg p-3 sm:p-4 hover:bg-spotify-hover transition-colors group relative cursor-pointer"
                  onClick={() => requireAuth(() => playSong(song, discoverSongs))}
                >
                  <div className="w-full aspect-square bg-spotify-card rounded-md overflow-hidden mb-3 relative">
                    {song.album?.cover_image ? (
                      <img
                        src={song.album.cover_image}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white/60" />
                      </div>
                    )}
                    <button className="play-button-overlay" aria-label={`Play ${song.title}`}>
                      <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-white truncate">{song.title}</p>
                  <p className="text-xs text-spotify-muted truncate mt-1">
                    {song.artists?.map((a) => a.name).join(', ') || 'Unknown Artist'}
                  </p>
                  {song.streaming_histories_count !== undefined && (
                    <p className="text-[10px] text-spotify-green mt-1 font-semibold">
                      {song.streaming_histories_count.toLocaleString()} streams
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular Artists */}
        {artists && artists.length > 0 && (
          <section className="mb-8 sm:mb-10">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Popular Artists</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {artists.slice(0, 12).map((artist) => (
                <ArtistCard key={artist.id_artist} artist={artist} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Albums */}
        {albums && albums.length > 0 && (
          <section className="mb-8 sm:mb-10">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Popular Albums</h2>
              <Link
                href="/search"
                className="text-xs uppercase font-bold text-spotify-muted hover:text-white tracking-wider transition-colors"
              >
                Show all
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {albums.slice(0, 12).map((album) => (
                <AlbumCard key={album.id_album} album={album} />
              ))}
            </div>
          </section>
        )}

        {/* Podcasts */}
        {podcasts && podcasts.length > 0 && (
          <section className="mb-8 sm:mb-10">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Popular Podcasts</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {podcasts.slice(0, 6).map((podcast) => (
                <PodcastCard key={podcast.id_podcast} podcast={podcast} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Playlists */}
        {playlists && playlists.length > 0 && (
          <section className="mb-8 sm:mb-10">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Featured Playlists</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {playlists.slice(0, 12).map((playlist) => (
                <PlaylistCard key={playlist.id_playlist} playlist={playlist} />
              ))}
            </div>
          </section>
        )}

        {/* Logged-in user sections */}
        {user && userPlaylists && userPlaylists.length > 0 && (
          <section className="mb-8 sm:mb-10">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Playlist Anda</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {userPlaylists.slice(0, 6).map((playlist) => (
                <PlaylistCard key={playlist.id_playlist} playlist={playlist} />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 sm:mt-16 pt-8 border-t border-spotify-border/20">
          <div className="text-center pb-8">
            <p className="text-sm text-spotify-muted mb-1">
              Enrico Moses x BasDat Group
            </p>
            <p className="text-xs text-spotify-muted/60">
              © 2026 Spotify Clone 2026. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
