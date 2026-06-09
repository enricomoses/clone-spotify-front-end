import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

interface LikeButtonProps {
  songId: string;
  isLiked?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function LikeButton({
  songId,
  isLiked: initialLiked = false,
  size = 'sm',
  className,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);
  const { requireAuth, user } = useRequireAuth();

  const handleToggle = () => {
    requireAuth(async () => {
      if (!user || isLoading) return;
      setIsLoading(true);
      try {
        if (isLiked) {
          await api.delete(`/users/${user.id_user}/unlike-song/${songId}`);
          setIsLiked(false);
        } else {
          await api.post(`/users/${user.id_user}/like-song`, { song_id: songId });
          setIsLiked(true);
        }
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
        isLiked
          ? 'text-spotify-green'
          : 'text-spotify-muted hover:text-white',
        className
      )}
      aria-label={isLiked ? 'Unlike song' : 'Like song'}
      title={isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
    >
      <Heart
        className={cn(
          iconSize,
          isLiked && 'fill-current'
        )}
      />
    </button>
  );
}
