import Link from 'next/link';
import { Play, Music2 } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import type { Song } from '@/types';

interface SongCardProps {
  song: Song;
  queue?: Song[];
}

export default function SongCard({ song, queue }: SongCardProps) {
  const playSong = usePlayerStore((s) => s.playSong);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playSong(song, queue || [song]);
  };

  const artistNames =
    song.artists?.map((a) => a.name).join(', ') ||
    song.album?.artists?.map((a) => a.name).join(', ') ||
    'Unknown Artist';

  return (
    <div className="group relative">
      <Link
        href={song.album ? `/album/${song.album.id_album}` : '#'}
        className="block bg-spotify-card/60 hover:bg-spotify-hover rounded-lg p-4 transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
      >
        {/* Cover Image */}
        <div className="relative aspect-square mb-4 rounded-md overflow-hidden bg-spotify-dark shadow-lg">
          {song.album?.cover_image ? (
            <img
              src={song.album.cover_image}
              alt={song.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-12 h-12 text-spotify-muted" />
            </div>
          )}
        </div>

        {/* Info */}
        <p className="text-sm font-bold text-white truncate mb-1">{song.title}</p>
        <p className="text-xs text-spotify-muted truncate">{artistNames}</p>
      </Link>

      {/* Play Button Overlay */}
      <button
        onClick={handlePlay}
        className="play-button-overlay"
        aria-label={`Play ${song.title}`}
      >
        <Play className="w-5 h-5 text-black fill-current ml-0.5" />
      </button>
    </div>
  );
}
