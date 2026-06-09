import Link from 'next/link';
import { useState } from 'react';
import { Play, Music, ListPlus } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatDuration } from '@/utils/formatDuration';
import LikeButton from './LikeButton';
import AddToPlaylistModal from '@/components/playlist/AddToPlaylistModal';
import type { Song } from '@/types';
import { cn } from '@/lib/utils';

interface SongRowProps {
  song: Song;
  index?: number;
  queue?: Song[];
  showAlbum?: boolean;
  showIndex?: boolean;
}

export default function SongRow({
  song,
  index = 0,
  queue = [],
  showAlbum = true,
  showIndex = true,
}: SongRowProps) {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const { requireAuth } = useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const isActive = currentSong?.id_song === song.id_song;
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const isLiked = user?.liked_songs?.some((s) => s.id_song === song.id_song) || false;

  const handlePlay = () => {
    requireAuth(() => {
      playSong(song, queue.length > 0 ? queue : [song]);
    });
  };

  return (
    <>
      <div
        className={cn(
          'group grid items-center gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer',
          showAlbum
            ? 'grid-cols-[16px_minmax(120px,4fr)_minmax(120px,2fr)_auto_minmax(40px,1fr)]'
            : 'grid-cols-[16px_minmax(120px,6fr)_auto_minmax(40px,1fr)]',
          isActive && 'bg-white/5'
        )}
        onDoubleClick={handlePlay}
      >
        {/* Index / Play icon */}
        <div className="flex items-center justify-center w-4">
          <span
            className={cn(
              'text-sm tabular-nums',
              isActive ? 'text-spotify-green' : 'text-spotify-muted',
              'group-hover:hidden'
            )}
          >
            {showIndex ? index + 1 : <Music className="w-4 h-4" />}
          </span>
          <button
            onClick={handlePlay}
            className="hidden group-hover:block text-white"
            aria-label={`Play ${song.title}`}
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Song Info */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Thumbnail */}
          <div className="w-10 h-10 bg-spotify-card rounded overflow-hidden shrink-0">
            {song.album?.cover_image ? (
              <img
                src={song.album.cover_image}
                alt={song.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-4 h-4 text-spotify-muted" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                'text-sm font-medium truncate',
                isActive ? 'text-spotify-green' : 'text-white'
              )}
            >
              {song.title}
            </p>
            <p className="text-xs text-spotify-muted truncate">
              {song.artists?.map((a) => a.name).join(', ') ||
                song.album?.artists?.map((a) => a.name).join(', ') ||
                'Unknown Artist'}
            </p>
          </div>
        </div>

        {/* Album */}
        {showAlbum && (
          <div className="min-w-0">
            {song.album && (
              <Link
                href={`/album/${song.album.id_album}`}
                className="text-sm text-spotify-muted hover:text-white hover:underline truncate block"
                onClick={(e) => e.stopPropagation()}
              >
                {song.album.title}
              </Link>
            )}
          </div>
        )}

        {/* Actions (Like + Add to Playlist) */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <LikeButton songId={song.id_song} isLiked={isLiked} size="sm" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              requireAuth(() => setShowPlaylistModal(true));
            }}
            className="text-spotify-muted hover:text-white transition-colors"
            aria-label="Add to playlist"
            title="Add to playlist"
          >
            <ListPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Duration */}
        <div className="flex justify-end">
          <span className="text-sm text-spotify-muted tabular-nums">
            {formatDuration(song.duration)}
          </span>
        </div>
      </div>

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        songId={song.id_song}
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
      />
    </>
  );
}
