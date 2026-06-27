import Link from 'next/link';
import { User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import FollowButton from '@/components/social/FollowButton';
import api from '@/lib/axios';
import type { User } from '@/types';

interface UserCardProps {
  user: User;
  onFollowChange?: () => void;
}

export default function UserCard({ user, onFollowChange }: UserCardProps) {
  const currentUser = useAuthStore((s) => s.user);
  const isSelf = currentUser?.id_user === user.id_user;

  // Check if current user follows this user
  const isFollowing = currentUser?.following?.some(
    (u) => u.id_user === user.id_user
  ) ?? false;

  const handleFollow = async () => {
    if (!currentUser) return;
    await api.post(`/users/${currentUser.id_user}/follow-user`, {
      target_id: user.id_user,
    });
    onFollowChange?.();
  };

  const handleUnfollow = async () => {
    if (!currentUser) return;
    await api.delete(`/users/${currentUser.id_user}/unfollow-user/${user.id_user}`);
    onFollowChange?.();
  };

  return (
    <div className="group bg-spotify-card/60 hover:bg-spotify-hover rounded-lg p-4 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 relative">
      <Link href={isSelf ? '/profile' : `/profile/${user.id_user}`} className="block">
        {/* Circular Avatar */}
        <div className="relative aspect-square mb-4 rounded-full overflow-hidden bg-spotify-dark shadow-xl mx-auto">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-600 to-slate-800">
              <UserIcon className="w-12 h-12 text-spotify-muted" />
            </div>
          )}
        </div>

        {/* Info */}
        <p className="text-sm font-bold text-white truncate text-center mb-1">
          {user.name}
        </p>
        <p className="text-xs text-spotify-muted text-center">
          {user.followers_count !== undefined
            ? `${user.followers_count} followers`
            : 'Profile'}
        </p>
      </Link>

      {/* Follow button — only show for other users when logged in */}
      {!isSelf && currentUser && (
        <div className="mt-3 flex justify-center">
          <FollowButton
            isFollowing={isFollowing}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            size="sm"
          />
        </div>
      )}
    </div>
  );
}
