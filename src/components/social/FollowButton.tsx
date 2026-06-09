import { useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
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
  const { requireAuth } = useRequireAuth();

  const handleClick = () => {
    requireAuth(() => {
      if (isFollowing) {
        onUnfollow?.();
      } else {
        onFollow?.();
      }
      setIsFollowing(!isFollowing);
    });
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'font-bold rounded-full transition-all duration-200 flex items-center gap-2',
        isFollowing
          ? isHovered
            ? 'border border-red-400/50 text-red-400 hover:bg-red-400/10'
            : 'border border-spotify-green text-spotify-green hover:bg-spotify-green/10'
          : 'border border-white/30 text-white hover:border-white hover:scale-105',
        size === 'sm' ? 'text-xs px-4 py-1.5' : 'text-sm px-6 py-2',
        className
      )}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
    >
      {isFollowing ? (
        <>
          {isHovered ? (
            <UserPlus className="w-4 h-4" />
          ) : (
            <UserCheck className="w-4 h-4" />
          )}
          {isHovered ? 'Unfollow' : 'Following'}
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Follow
        </>
      )}
    </button>
  );
}
