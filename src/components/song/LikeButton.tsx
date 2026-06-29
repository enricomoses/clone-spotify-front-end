import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import Spinner from '@/components/ui/Spinner';
import type { Song } from '@/types';

interface LikeButtonProps {
  songId: string;
  isLiked?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  song?: Song;
}

export default function LikeButton({
  songId,
  isLiked: initialLiked = false,
  size = 'sm',
  className,
  song,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);
  const { requireAuth, user } = useRequireAuth();
  const refreshUser = useAuthStore((s) => s.refreshUser);

  useEffect(() => {
    setIsLiked(initialLiked);
  }, [initialLiked]);

  const handleToggle = () => {
    requireAuth(async () => {
      if (!user || isLoading) return;
      setIsLoading(true);
      try {
        if (isLiked) {
          await api.post(`/users/${user.id_user}/unlike-song/${songId}`, {
            _method: 'DELETE',
          });
          // Optimistically update the Zustand store
          const updatedLikedSongs = user.liked_songs?.filter((s) => s.id_song !== songId) || [];
          useAuthStore.setState({
            user: {
              ...user,
              liked_songs: updatedLikedSongs,
            },
          });
          setIsLiked(false);
        } else {
          await api.post(`/users/${user.id_user}/like-song`, {
            song_id: songId,
          });
          // Optimistically update the Zustand store
          const updatedLikedSongs = [...(user.liked_songs || [])];
          if (!updatedLikedSongs.some((s) => s.id_song === songId)) {
            if (song) {
              updatedLikedSongs.push(song);
            } else {
              updatedLikedSongs.push({ id_song: songId } as Song);
            }
          }
          useAuthStore.setState({
            user: {
              ...user,
              liked_songs: updatedLikedSongs,
            },
          });
          setIsLiked(true);
        }
        await refreshUser();
      } catch (e) {
        console.error('Failed to toggle like', e);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        'transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50',
        isLiked ? 'text-spotify-green' : 'text-spotify-muted hover:text-white',
        className,
      )}
      aria-label={isLiked ? 'Unlike song' : 'Like song'}
      title={isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
    >
      {isLoading ? (
        <Spinner size="sm" className={cn(iconSize, 'border-current border-t-transparent animate-spin')} />
      ) : (
        <Heart className={cn(iconSize, isLiked && 'fill-current')} />
      )}
    </button>
  );
}

