import Link from 'next/link';
import { useRouter } from 'next/router';
import { Play, Music } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import type { Playlist } from '@/types';

interface PlaylistCardProps {
  playlist: Playlist;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  const playSong = usePlayerStore((s) => s.playSong);
  const router = useRouter();

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  // Find the owner from collaborators
  const owner = playlist.collaborators?.find(
    (c) => c.pivot?.role === 'Owner'
  );
  const ownerName = owner?.name || playlist.owner?.name || 'Unknown';
  const ownerId = owner?.id_user || playlist.owner?.id_user || playlist.id_user;

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (ownerId) {
      router.push(`/profile/${ownerId}`);
    }
  };

  return (
    <div className="group relative">
      <Link
        href={`/playlist/${playlist.id_playlist}`}
        className="block bg-spotify-card/60 hover:bg-spotify-hover rounded-lg p-4 transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
      >
        <div className="relative aspect-square mb-4 rounded-md overflow-hidden bg-spotify-dark shadow-lg">
          {playlist.cover_image ? (
            <img
              src={playlist.cover_image}
              alt={playlist.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-800">
              <Music className="w-12 h-12 text-white/60" />
            </div>
          )}
        </div>
        <p className="text-sm font-bold text-white truncate mb-1">{playlist.name}</p>
        <p className="text-xs text-spotify-muted line-clamp-2">
          {playlist.description || (
            <>
              By{' '}
              <span
                onClick={handleCreatorClick}
                className="hover:text-white hover:underline transition-colors cursor-pointer"
                role="link"
              >
                {ownerName}
              </span>
            </>
          )}
        </p>
      </Link>

      {playlist.songs && playlist.songs.length > 0 && (
        <button
          onClick={handlePlay}
          className="play-button-overlay"
          aria-label={`Play ${playlist.name}`}
        >
          <Play className="w-5 h-5 text-black fill-current ml-0.5" />
        </button>
      )}
    </div>
  );
}
