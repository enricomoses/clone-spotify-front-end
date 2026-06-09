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
import { PageLoading } from '@/components/ui/Spinner';
import type { Album, Artist, Playlist, Song, Podcast } from '@/types';
import Link from 'next/link';
import { Play, Sparkles } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const { requireAuth } = useRequireAuth();
  const playSong = usePlayerStore((s) => s.playSong);

  const { data: albums, isLoading: albumsLoading } = useSWR<Album[]>('/albums', fetcher);
  const { data: artists, isLoading: artistsLoading } = useSWR<Artist[]>('/artists', fetcher);
  const { data: playlists, isLoading: playlistsLoading } = useSWR<Playlist[]>('/playlists', fetcher);
  const { data: podcasts } = useSWR<Podcast[]>('/podcasts', fetcher);
  const { data: discoverSongs } = useSWR<Song[]>('/songs/discover-weekly', fetcher);

  const isLoading = albumsLoading || artistsLoading || playlistsLoading;

  if (isLoading) return <PageLoading />;

  // Filter user-specific data
  const userPlaylists = user && playlists
    ? playlists.filter((p) =>
        p.collaborators?.some((c) => c.id_user === user.id_user) ||
        p.id_user === user.id_user
      )
    : [];

  return (
    <>
      <Head>
        <title>Home — Spotify Clone</title>
        <meta name="description" content="Discover new music, playlists, and podcasts on Spotify Clone" />
      </Head>

      <div className="px-6 pb-8">
        {/* Greeting */}
        <div className="mb-8 pt-4">
          <h1 className="text-3xl font-bold text-white">
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
            {albums.slice(0, 6).map((album) => (
              <Link
                key={album.id_album}
                href={`/album/${album.id_album}`}
                className="flex items-center bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-colors group"
              >
                <div className="w-16 h-16 shrink-0">
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
                <span className="px-4 text-sm font-bold text-white truncate">
                  {album.title}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Discover Weekly Preview */}
        {discoverSongs && discoverSongs.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Discover Weekly</h2>
              </div>
              <Link
                href="/discover-weekly"
                className="text-xs uppercase font-bold text-spotify-muted hover:text-white tracking-wider transition-colors"
              >
                Show all
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {discoverSongs.slice(0, 5).map((song) => (
                <div
                  key={song.id_song}
                  className="bg-spotify-card/60 rounded-lg p-4 hover:bg-spotify-hover transition-colors group relative cursor-pointer"
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
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-white">Popular Artists</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {artists.slice(0, 12).map((artist) => (
                <ArtistCard key={artist.id_artist} artist={artist} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Albums */}
        {albums && albums.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-white">Popular Albums</h2>
              <Link
                href="/search"
                className="text-xs uppercase font-bold text-spotify-muted hover:text-white tracking-wider transition-colors"
              >
                Show all
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {albums.slice(0, 12).map((album) => (
                <AlbumCard key={album.id_album} album={album} />
              ))}
            </div>
          </section>
        )}

        {/* Podcasts */}
        {podcasts && podcasts.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-white">Popular Podcasts</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {podcasts.slice(0, 6).map((podcast) => (
                <PodcastCard key={podcast.id_podcast} podcast={podcast} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Playlists */}
        {playlists && playlists.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-white">Featured Playlists</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {playlists.slice(0, 12).map((playlist) => (
                <PlaylistCard key={playlist.id_playlist} playlist={playlist} />
              ))}
            </div>
          </section>
        )}

        {/* Logged-in user sections */}
        {user && userPlaylists.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-white">Playlist Anda</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {userPlaylists.slice(0, 6).map((playlist) => (
                <PlaylistCard key={playlist.id_playlist} playlist={playlist} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
