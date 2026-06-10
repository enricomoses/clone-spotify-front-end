import { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { cn } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

interface FollowButtonProps {
  isFollowing?: boolean;
  onFollow?: () => void | Promise<void>;
  onUnfollow?: () => void | Promise<void>;
  size?: 'sm' | 'md';
  className?: string;
}

export default function FollowButton({
  isFollowing: initialFollowing = false,
  onFollow,
  onUnfollow,
  size = 'md',
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { requireAuth } = useRequireAuth();

  useEffect(() => {
    setIsFollowing(initialFollowing);
  }, [initialFollowing]);

  const handleClick = () => {
    requireAuth(async () => {
      setIsLoading(true);
      try {
        if (isFollowing) {
          await onUnfollow?.();
        } else {
          await onFollow?.();
        }
        setIsFollowing(!isFollowing);
      } catch (e) {
        console.error('Failed to update follow status', e);
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      className={cn(
        'font-bold rounded-full transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
        isFollowing
          ? isHovered && !isLoading
            ? 'border border-red-400/50 text-red-400 hover:bg-red-400/10'
            : 'border border-spotify-green text-spotify-green hover:bg-spotify-green/10'
          : 'border border-white/30 text-white hover:border-white hover:scale-105',
        size === 'sm' ? 'text-xs px-4 py-1.5' : 'text-sm px-6 py-2',
        className
      )}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
    >
      {isLoading ? (
        <Spinner size="sm" className="w-4 h-4 border-current border-t-transparent animate-spin" />
      ) : isFollowing ? (
        isHovered ? (
          <UserPlus className="w-4 h-4" />
        ) : (
          <UserCheck className="w-4 h-4" />
        )
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
      {isFollowing ? (
        <>
          {isLoading ? (
            'Unfollowing...'
          ) : isHovered ? (
            'Unfollow'
          ) : (
            'Following'
          )}
        </>
      ) : (
        <>
          {isLoading ? 'Following...' : 'Follow'}
        </>
      )}
    </button>
  );
}

