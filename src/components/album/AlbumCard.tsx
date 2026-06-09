import Link from 'next/link';
import { Play, Music } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import type { Album } from '@/types';

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const playSong = usePlayerStore((s) => s.playSong);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (album.songs && album.songs.length > 0) {
      playSong(album.songs[0], album.songs);
    }
  };

  const artistNames = album.artists?.map((a) => a.name).join(', ') || 'Unknown Artist';

  return (
    <div className="group relative">
      <Link
        href={`/album/${album.id_album}`}
        className="block bg-spotify-card/60 hover:bg-spotify-hover rounded-lg p-4 transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
      >
        <div className="relative aspect-square mb-4 rounded-md overflow-hidden bg-spotify-dark shadow-lg">
          {album.cover_image ? (
            <img
              src={album.cover_image}
              alt={album.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-12 h-12 text-spotify-muted" />
            </div>
          )}
        </div>
        <p className="text-sm font-bold text-white truncate mb-1">{album.title}</p>
        <p className="text-xs text-spotify-muted truncate">
          {album.release ? new Date(album.release).getFullYear() + ' • ' : ''}
          {artistNames}
        </p>
      </Link>

      {album.songs && album.songs.length > 0 && (
        <button
          onClick={handlePlay}
          className="play-button-overlay"
          aria-label={`Play ${album.title}`}
        >
          <Play className="w-5 h-5 text-black fill-current ml-0.5" />
        </button>
      )}
    </div>
  );
}
