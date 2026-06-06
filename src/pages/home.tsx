import Head from 'next/head';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { withAuth } from '@/utils/withAuth';
import { getGreeting } from '@/utils/formatDuration';
import AlbumCard from '@/components/album/AlbumCard';
import ArtistCard from '@/components/artist/ArtistCard';
import PlaylistCard from '@/components/playlist/PlaylistCard';
import { PageLoading } from '@/components/ui/Spinner';
import type { Album, Artist, Playlist, Song } from '@/types';
import Link from 'next/link';

function HomePage() {
  const { data: albums, isLoading: albumsLoading } = useSWR<Album[]>('/albums', fetcher);
  const { data: artists, isLoading: artistsLoading } = useSWR<Artist[]>('/artists', fetcher);
  const { data: playlists, isLoading: playlistsLoading } = useSWR<Playlist[]>('/playlists', fetcher);
  const { data: songs } = useSWR<Song[]>('/songs', fetcher);

  const isLoading = albumsLoading || artistsLoading || playlistsLoading;

  if (isLoading) return <PageLoading />;

  return (
    <>
      <Head>
        <title>Home — Spotify Clone</title>
      </Head>

      <div className="px-6 pb-8">
        {/* Greeting */}
        <div className="mb-8 pt-4">
          <h1 className="text-3xl font-bold text-white">{getGreeting()}</h1>
        </div>

        {/* Quick Play Grid — Top albums/playlists */}
        {(albums || playlists) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
            {albums?.slice(0, 6).map((album) => (
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

        {/* Albums Section */}
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

        {/* Artists Section */}
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

        {/* Playlists Section */}
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
      </div>
    </>
  );
}

export default withAuth(HomePage);
