import { useState, useMemo } from 'react';
import Link from 'next/link';
import { User as UserIcon, Music2, Search, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import FollowButton from '@/components/social/FollowButton';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/axios';
import type { User, Artist } from '@/types';

type TabKey = 'followers' | 'following';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabKey;
  followers: User[];
  followingUsers: User[];
  followingArtists: Artist[];
  onFollowChange?: () => void;
}

export default function FollowersModal({
  isOpen,
  onClose,
  initialTab = 'followers',
  followers,
  followingUsers,
  followingArtists,
  onFollowChange,
}: FollowersModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = useAuthStore((s) => s.user);

  // Reset search when tab changes
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  // Build combined following list (users + artists)
  const followingList = useMemo(() => {
    const items: Array<{
      id: string;
      name: string;
      profile_picture?: string;
      type: 'user' | 'artist';
      href: string;
    }> = [];

    followingUsers.forEach((u) => {
      items.push({
        id: u.id_user,
        name: u.name,
        profile_picture: u.profile_picture,
        type: 'user',
        href: u.id_user === currentUser?.id_user ? '/profile' : `/profile/${u.id_user}`,
      });
    });

    followingArtists.forEach((a) => {
      items.push({
        id: a.id_artist,
        name: a.name,
        profile_picture: a.profile_picture,
        type: 'artist',
        href: `/artist/${a.id_artist}`,
      });
    });

    return items;
  }, [followingUsers, followingArtists, currentUser]);

  // Filter by search
  const filteredFollowers = useMemo(() => {
    if (!searchQuery) return followers;
    const q = searchQuery.toLowerCase();
    return followers.filter((u) => u.name.toLowerCase().includes(q));
  }, [followers, searchQuery]);

  const filteredFollowing = useMemo(() => {
    if (!searchQuery) return followingList;
    const q = searchQuery.toLowerCase();
    return followingList.filter((item) => item.name.toLowerCase().includes(q));
  }, [followingList, searchQuery]);

  const handleFollowUser = async (targetId: string) => {
    if (!currentUser) return;
    await api.post(`/users/${currentUser.id_user}/follow-user`, {
      target_id: targetId,
    });
    onFollowChange?.();
  };

  const handleUnfollowUser = async (targetId: string) => {
    if (!currentUser) return;
    await api.post(`/users/${currentUser.id_user}/unfollow-user/${targetId}`, {
      _method: 'DELETE',
    });
    onFollowChange?.();
  };

  const isFollowingUser = (userId: string) => {
    return currentUser?.following?.some((u) => u.id_user === userId) ?? false;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      {/* Custom Header with Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          <button
            onClick={() => handleTabChange('followers')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              activeTab === 'followers'
                ? 'bg-white text-black'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Followers ({followers.length})
          </button>
          <button
            onClick={() => handleTabChange('following')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              activeTab === 'following'
                ? 'bg-white text-black'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Following ({followingList.length})
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-spotify-muted hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-spotify-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab}...`}
          className="w-full bg-spotify-dark/80 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
        />
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto space-y-1 scrollbar-hidden">
        {activeTab === 'followers' && (
          <>
            {filteredFollowers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserIcon className="w-10 h-10 text-spotify-muted/30 mb-3" />
                <p className="text-sm text-spotify-muted">
                  {searchQuery ? 'No followers found' : 'No followers yet'}
                </p>
              </div>
            ) : (
              filteredFollowers.map((user) => (
                <FollowListItem
                  key={user.id_user}
                  id={user.id_user}
                  name={user.name}
                  profilePicture={user.profile_picture}
                  type="user"
                  href={user.id_user === currentUser?.id_user ? '/profile' : `/profile/${user.id_user}`}
                  isSelf={user.id_user === currentUser?.id_user}
                  isFollowing={isFollowingUser(user.id_user)}
                  onFollow={() => handleFollowUser(user.id_user)}
                  onUnfollow={() => handleUnfollowUser(user.id_user)}
                  onClose={onClose}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'following' && (
          <>
            {filteredFollowing.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserIcon className="w-10 h-10 text-spotify-muted/30 mb-3" />
                <p className="text-sm text-spotify-muted">
                  {searchQuery ? 'No results found' : 'Not following anyone yet'}
                </p>
              </div>
            ) : (
              filteredFollowing.map((item) => (
                <FollowListItem
                  key={`${item.type}-${item.id}`}
                  id={item.id}
                  name={item.name}
                  profilePicture={item.profile_picture}
                  type={item.type}
                  href={item.href}
                  isSelf={item.type === 'user' && item.id === currentUser?.id_user}
                  isFollowing={item.type === 'user' ? isFollowingUser(item.id) : true}
                  onFollow={item.type === 'user' ? () => handleFollowUser(item.id) : undefined}
                  onUnfollow={item.type === 'user' ? () => handleUnfollowUser(item.id) : undefined}
                  onClose={onClose}
                  showTypeLabel
                />
              ))
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

// Individual list item in the modal
interface FollowListItemProps {
  id: string;
  name: string;
  profilePicture?: string;
  type: 'user' | 'artist';
  href: string;
  isSelf: boolean;
  isFollowing: boolean;
  onFollow?: () => Promise<void> | void;
  onUnfollow?: () => Promise<void> | void;
  onClose: () => void;
  showTypeLabel?: boolean;
}

function FollowListItem({
  name,
  profilePicture,
  type,
  href,
  isSelf,
  isFollowing,
  onFollow,
  onUnfollow,
  onClose,
  showTypeLabel,
}: FollowListItemProps) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group/item">
      {/* Avatar */}
      <Link href={href} onClick={onClose} className="shrink-0">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-spotify-dark shadow-md">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-600 to-slate-800">
              {type === 'artist' ? (
                <Music2 className="w-5 h-5 text-spotify-muted" />
              ) : (
                <UserIcon className="w-5 h-5 text-spotify-muted" />
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Name + badge */}
      <Link href={href} onClick={onClose} className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate group-hover/item:underline">
          {name}
        </p>
        {showTypeLabel && (
          <p className="text-xs text-spotify-muted capitalize">{type}</p>
        )}
      </Link>

      {/* Follow button (not for self, not for artists in following tab) */}
      {!isSelf && type === 'user' && onFollow && onUnfollow && (
        <FollowButton
          isFollowing={isFollowing}
          onFollow={onFollow}
          onUnfollow={onUnfollow}
          size="sm"
        />
      )}
    </div>
  );
}
