import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import { Play, User } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { withAuth } from '@/utils/withAuth';
import { usePlayerStore } from '@/stores/usePlayerStore';
import SongList from '@/components/song/SongList';
import AlbumCard from '@/components/album/AlbumCard';
import { PageLoading } from '@/components/ui/Spinner';
import type { Artist } from '@/types';

function ArtistProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const playSong = usePlayerStore((s) => s.playSong);

  const { data: artist, isLoading } = useSWR<Artist>(
    id ? `/artists/${id}` : null,
    fetcher
  );

  if (isLoading || !artist) return <PageLoading />;

  const handlePlayAll = () => {
    if (artist.songs && artist.songs.length > 0) {
      playSong(artist.songs[0], artist.songs);
    }
  };

  return (
    <>
      <Head>
        <title>{artist.name} — Spotify Clone</title>
      </Head>

      <div className="-mt-[60px]">
        {/* Banner */}
        <div
          className="relative flex items-end gap-6 px-8 pt-24 pb-8"
          style={{
            background: 'linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), linear-gradient(135deg, #1e3a5f 0%, #0d1117 100%)',
            minHeight: '400px',
          }}
        >
          {/* Artist Image (circular) */}
          <div className="w-52 h-52 shrink-0 rounded-full overflow-hidden shadow-2xl shadow-black/50">
            {artist.profile_picture ? (
              <img
                src={artist.profile_picture}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-spotify-card flex items-center justify-center">
                <User className="w-16 h-16 text-spotify-muted" />
              </div>
            )}
          </div>

          {/* Artist Info */}
          <div className="flex flex-col justify-end">
            <p className="text-sm font-bold uppercase text-white/80 mb-1">Artist</p>
            <h1 className="text-6xl font-black text-white mb-4 leading-tight">
              {artist.name}
            </h1>
            {artist.bio && (
              <p className="text-sm text-white/70 max-w-lg line-clamp-2">{artist.bio}</p>
            )}
          </div>
        </div>

        {/* Controls + Content */}
        <div className="relative">
          <div
            className="absolute inset-0 h-60"
            style={{
              background: 'linear-gradient(rgba(0,0,0,.6), #121212)',
            }}
          />

          <div className="relative z-10 px-8 py-6">
            {/* Play + Follow */}
            <div className="flex items-center gap-6 mb-8">
              <button
                onClick={handlePlayAll}
                className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center hover:scale-110 hover:bg-spotify-green-bright transition-all shadow-lg"
                aria-label="Play all"
              >
                <Play className="w-6 h-6 text-black fill-current ml-0.5" />
              </button>
              <button className="btn-outline text-sm py-1.5 px-6">
                Follow
              </button>
            </div>

            {/* Popular Songs */}
            {artist.songs && artist.songs.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-5">Popular</h2>
                <div className="max-w-4xl">
                  <SongList
                    songs={artist.songs.slice(0, 5)}
                    showAlbum={true}
                    showHeader={false}
                  />
                </div>
              </section>
            )}

            {/* Albums */}
            {artist.albums && artist.albums.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-5">Albums</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {artist.albums.map((album) => (
                    <AlbumCard key={album.id_album} album={album} />
                  ))}
                </div>
              </section>
            )}

            {/* Social Links */}
            {(artist.instagram || artist.facebook || artist.wikipedia || artist.x) && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-5">Social</h2>
                <div className="flex gap-4">
                  {artist.instagram && (
                    <a
                      href={artist.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-spotify-card hover:bg-spotify-hover rounded-full text-sm text-white transition-colors"
                    >
                      Instagram
                    </a>
                  )}
                  {artist.facebook && (
                    <a
                      href={artist.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-spotify-card hover:bg-spotify-hover rounded-full text-sm text-white transition-colors"
                    >
                      Facebook
                    </a>
                  )}
                  {artist.x && (
                    <a
                      href={artist.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-spotify-card hover:bg-spotify-hover rounded-full text-sm text-white transition-colors"
                    >
                      X / Twitter
                    </a>
                  )}
                  {artist.wikipedia && (
                    <a
                      href={artist.wikipedia}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-spotify-card hover:bg-spotify-hover rounded-full text-sm text-white transition-colors"
                    >
                      Wikipedia
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(ArtistProfilePage);
