import SongRow from './SongRow';
import { Clock3 } from 'lucide-react';
import type { Song } from '@/types';

interface SongListProps {
  songs: Song[];
  showAlbum?: boolean;
  showHeader?: boolean;
  showLastPlayed?: boolean;
}

export default function SongList({
  songs,
  showAlbum = true,
  showHeader = true,
  showLastPlayed = false,
}: SongListProps) {
  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-spotify-muted text-sm">No songs found</p>
      </div>
    );
  }

  const getGridCols = () => {
    if (showLastPlayed && showAlbum) {
      return 'grid-cols-[16px_minmax(120px,6fr)_auto_minmax(40px,1fr)] md:grid-cols-[16px_minmax(120px,3.5fr)_minmax(120px,2fr)_minmax(120px,2.5fr)_auto_minmax(40px,1fr)]';
    }
    if (showAlbum) {
      return 'grid-cols-[16px_minmax(120px,6fr)_auto_minmax(40px,1fr)] md:grid-cols-[16px_minmax(120px,4fr)_minmax(120px,2fr)_auto_minmax(40px,1fr)]';
    }
    return 'grid-cols-[16px_minmax(120px,6fr)_auto_minmax(40px,1fr)]';
  };

  return (
    <div>
      {/* Header Row */}
      {showHeader && (
        <div
          className={`grid items-center gap-4 px-4 py-2 border-b border-spotify-border/30 mb-2 text-spotify-muted text-xs uppercase tracking-wider font-medium ${getGridCols()}`}
        >
          <span className="text-center">#</span>
          <span>Title</span>
          {showAlbum && <span className="hidden md:block">Album</span>}
          {showLastPlayed && <span className="hidden md:block">Last Played</span>}
          <span className="w-[48px]"></span>
          <span className="flex justify-end">
            <Clock3 className="w-4 h-4" />
          </span>
        </div>
      )}

      {/* Song Rows */}
      <div className="space-y-0.5">
        {songs.map((song, index) => (
          <SongRow
            key={song.id_song}
            song={song}
            index={index}
            queue={songs}
            showAlbum={showAlbum}
            showLastPlayed={showLastPlayed}
          />
        ))}
      </div>
    </div>
  );
}
