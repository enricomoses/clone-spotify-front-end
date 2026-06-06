import { Trash2, Edit, Play, Music2 } from 'lucide-react';
import { formatDuration } from '@/utils/formatDuration';
import type { Song } from '@/types';
import Link from 'next/link';

interface SongManageRowProps {
  song: Song;
  index: number;
  onDelete?: (song: Song) => void;
}

export default function SongManageRow({ song, index, onDelete }: SongManageRowProps) {
  return (
    <div className="group grid grid-cols-[40px_1fr_180px_100px_120px] items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors">
      {/* Index */}
      <span className="text-sm text-spotify-muted tabular-nums text-center">
        {index + 1}
      </span>

      {/* Song Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-spotify-card rounded overflow-hidden shrink-0">
          {song.album?.cover_image ? (
            <img
              src={song.album.cover_image}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-4 h-4 text-spotify-muted" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{song.title}</p>
          <p className="text-xs text-spotify-muted truncate">
            {song.album?.title || 'No album'}
          </p>
        </div>
      </div>

      {/* Album */}
      <span className="text-sm text-spotify-muted truncate">
        {song.album?.title || '-'}
      </span>

      {/* Duration */}
      <span className="text-sm text-spotify-muted tabular-nums">
        {formatDuration(song.duration)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/artist/songs/${song.id_song}/edit`}
          className="p-2 text-spotify-muted hover:text-white transition-colors rounded-full hover:bg-white/10"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </Link>
        <button
          onClick={() => onDelete?.(song)}
          className="p-2 text-spotify-muted hover:text-red-400 transition-colors rounded-full hover:bg-red-400/10"
          title="Delete"
          aria-label={`Delete ${song.title}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
