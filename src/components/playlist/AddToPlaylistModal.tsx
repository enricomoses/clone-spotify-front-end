import { useState } from 'react';
import useSWR from 'swr';
import { X, Plus, Loader2, Music, Check } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { fetcher } from '@/lib/fetcher';
import type { Playlist } from '@/types';
import api from '@/lib/axios';

interface AddToPlaylistModalProps {
  songId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToPlaylistModal({
  songId,
  isOpen,
  onClose,
}: AddToPlaylistModalProps) {
  const { user } = useRequireAuth();
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set());

  const { data: allPlaylists } = useSWR<Playlist[]>(
    isOpen && user ? `/users/${user.id_user}/playlists` : null,
    fetcher
  );

  // Filter playlists where user is Owner or Editor
  const userPlaylists = allPlaylists?.filter((p) => {
    if (p.id_user === user?.id_user) return true;
    return p.collaborators?.some(
      (c) =>
        c.id_user === user?.id_user &&
        (c.pivot?.role === 'Owner' || c.pivot?.role === 'Editor')
    );
  }) || [];

  const handleAdd = async (playlistId: string) => {
    setAddingTo(playlistId);
    try {
      await api.post(`/playlists/${playlistId}/songs`, { song_id: songId, id_user: user?.id_user });
      setAddedTo((prev) => new Set(prev).add(playlistId));
    } catch (e) {
      console.error('Failed to add song to playlist', e);
    } finally {
      setAddingTo(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-spotify-card rounded-xl shadow-2xl shadow-black/50 border border-spotify-border/20 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-spotify-border/20">
          <h3 className="text-base font-bold text-white">Add to Playlist</h3>
          <button
            onClick={onClose}
            className="text-spotify-muted hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playlist List */}
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {userPlaylists.length > 0 ? (
            userPlaylists.map((playlist) => {
              const isAdded = addedTo.has(playlist.id_playlist);
              const isAdding = addingTo === playlist.id_playlist;

              return (
                <button
                  key={playlist.id_playlist}
                  onClick={() => !isAdded && handleAdd(playlist.id_playlist)}
                  disabled={isAdding || isAdded}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition-colors disabled:opacity-70"
                >
                  <div className="w-10 h-10 rounded bg-spotify-hover overflow-hidden shrink-0">
                    {playlist.cover_image ? (
                      <img
                        src={playlist.cover_image}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-4 h-4 text-spotify-muted" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white truncate">
                      {playlist.name}
                    </p>
                    <p className="text-xs text-spotify-muted">
                      {playlist.songs?.length || 0} songs
                    </p>
                  </div>
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 text-spotify-muted animate-spin" />
                  ) : isAdded ? (
                    <Check className="w-4 h-4 text-spotify-green" />
                  ) : (
                    <Plus className="w-4 h-4 text-spotify-muted" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-spotify-muted">
                No playlists found. Create one first!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
