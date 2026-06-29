import Link from 'next/link';
import { User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types';

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  const currentUser = useAuthStore((s) => s.user);
  const isSelf = currentUser?.id_user === user.id_user;

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
    </div>
  );
}
