import { useState } from 'react';
import { mutate } from 'swr';
import { X, UserPlus, Trash2, Loader2, Shield, Edit3 } from 'lucide-react';
import UserAutocomplete from '@/components/ui/UserAutocomplete';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/axios';
import { useToastStore } from '@/components/ui/Toast';
import type { PlaylistCollaborator, User } from '@/types';

interface AddCollaboratorModalProps {
  playlistId: string;
  collaborators: PlaylistCollaborator[];
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCollaboratorModal({
  playlistId,
  collaborators,
  isOpen,
  onClose,
}: AddCollaboratorModalProps) {
  const user = useAuthStore((s) => s.user);
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const addToast = useToastStore((s) => s.addToast);

  const handleAddCollaborator = async (selectedUser: User) => {
    if (!user) return;
    setIsAdding(true);
    setError('');

    try {
      await api.post(`/playlists/${playlistId}/collaborators`, {
        user_id: selectedUser.id_user,
        id_user: user.id_user,
      });
      addToast(`${selectedUser.name} berhasil ditambahkan sebagai Editor`, 'success');
      mutate(`/playlists/${playlistId}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal menambahkan kolaborator';
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!user) return;
    setRemovingId(userId);
    setError('');

    try {
      await api.post(`/playlists/${playlistId}/collaborators/${userId}`, {
        _method: 'DELETE',
        id_user: user.id_user,
      });
      mutate(`/playlists/${playlistId}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal menghapus kolaborator';
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } finally {
      setRemovingId(null);
    }
  };

  if (!isOpen) return null;

  // IDs to exclude from autocomplete search (already collaborators)
  const excludeIds = collaborators.map((c) => c.id_user);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-spotify-card rounded-xl shadow-2xl shadow-black/50 border border-spotify-border/20 animate-slide-up mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-spotify-border/20">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-spotify-green" />
            <h3 className="text-lg font-bold text-white">Manage Collaborators</h3>
          </div>
          <button
            onClick={onClose}
            className="text-spotify-muted hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Error / Success messages */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-2 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* User Search */}
          <div>
            <UserAutocomplete
              onSelect={handleAddCollaborator}
              excludeIds={excludeIds}
              label="Add Collaborator"
              placeholder="Search user by name or email..."
            />
            {isAdding && (
              <div className="flex items-center gap-2 mt-2 text-xs text-spotify-muted">
                <Loader2 className="w-3 h-3 animate-spin" />
                Adding...
              </div>
            )}
          </div>

          {/* Current Collaborators */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-spotify-muted tracking-wider mb-3">
              Current Collaborators ({collaborators.length})
            </h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {collaborators.map((collab) => {
                const isOwner = collab.pivot?.role === 'Owner';
                const isEditor = collab.pivot?.role === 'Editor';

                return (
                  <div
                    key={collab.id_user}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-spotify-hover shrink-0 ring-1 ring-white/10">
                        {collab.profile_picture ? (
                          <img
                            src={collab.profile_picture}
                            alt={collab.name || ''}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-spotify-muted">
                            <UserPlus className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {collab.name || collab.email || collab.id_user}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {isOwner ? (
                            <Shield className="w-3 h-3 text-spotify-green" />
                          ) : (
                            <Edit3 className="w-3 h-3 text-blue-400" />
                          )}
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isOwner
                                ? 'text-spotify-green'
                                : isEditor
                                  ? 'text-blue-400'
                                  : 'text-spotify-muted'
                            }`}
                          >
                            {collab.pivot?.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Remove button (only for non-owner) */}
                    {!isOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCollaborator(collab.id_user)}
                        disabled={removingId === collab.id_user}
                        className="p-1.5 text-spotify-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove collaborator"
                      >
                        {removingId === collab.id_user ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-full transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
