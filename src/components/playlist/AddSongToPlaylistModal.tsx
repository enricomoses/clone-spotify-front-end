import { useState, useEffect, useRef, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { X, Search, Plus, Loader2, Music, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { fetcher } from '@/lib/fetcher';
import api from '@/lib/axios';
import type { Song } from '@/types';
import { useToastStore } from '@/components/ui/Toast';

interface AddSongToPlaylistModalProps {
  playlistId: string;
  existingSongIds: string[];
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSongToPlaylistModal({
  playlistId,
  existingSongIds,
  isOpen,
  onClose,
}: AddSongToPlaylistModalProps) {
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setDebouncedQuery('');
      setAddedIds(new Set());
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const { data: allSongs } = useSWR<Song[]>(isOpen ? '/songs' : null, fetcher);

  // Filter songs
  const filteredSongs = (allSongs || []).filter((song) => {
    if (existingSongIds.includes(song.id_song)) return false;
    if (addedIds.has(song.id_song)) return false;
    if (!debouncedQuery) return false; // Only show results when searching
    const q = debouncedQuery.toLowerCase();
    return (
      song.title.toLowerCase().includes(q) ||
      song.artists?.some((a) => a.name.toLowerCase().includes(q))
    );
  });

  const handleAddSong = useCallback(
    async (songId: string) => {
      if (!user) return;
      setAddingId(songId);
      try {
        await api.post(`/playlists/${playlistId}/songs`, {
          song_id: songId,
          id_user: user.id_user,
        });
        setAddedIds((prev) => new Set(prev).add(songId));
        mutate(`/playlists/${playlistId}`);
        addToast('Lagu berhasil ditambahkan ke playlist', 'success');
      } catch (err) {
        console.error('Failed to add song to playlist', err);
        addToast('Gagal menambahkan lagu ke playlist', 'error');
      } finally {
        setAddingId(null);
      }
    },
    [playlistId, user, addToast]
  );

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-spotify-card rounded-xl shadow-2xl shadow-black/50 border border-spotify-border/20 animate-slide-up mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-spotify-border/20">
          <h3 className="text-base font-bold text-white">Add Songs to Playlist</h3>
          <button
            onClick={onClose}
            className="text-spotify-muted hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-spotify-muted pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs by title or artist..."
              className="w-full bg-spotify-hover border border-spotify-border rounded-md pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto px-2 pb-4">
          {debouncedQuery ? (
            filteredSongs.length > 0 ? (
              filteredSongs.slice(0, 20).map((song) => {
                const isAdding = addingId === song.id_song;
                const isAdded = addedIds.has(song.id_song);

                return (
                  <button
                    key={song.id_song}
                    onClick={() => !isAdded && handleAddSong(song.id_song)}
                    disabled={isAdding || isAdded}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-white/10 transition-colors disabled:opacity-60"
                  >
                    {/* Album art */}
                    <div className="w-10 h-10 rounded bg-spotify-hover overflow-hidden shrink-0">
                      {song.album?.cover_image ? (
                        <img
                          src={song.album.cover_image}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-4 h-4 text-spotify-muted" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-white truncate">
                        {song.title}
                      </p>
                      <p className="text-xs text-spotify-muted truncate">
                        {song.artists?.map((a) => a.name).join(', ') || 'Unknown Artist'}
                        {song.album && ` • ${song.album.title}`}
                      </p>
                    </div>
                    {/* Duration */}
                    <span className="text-xs text-spotify-muted shrink-0 mr-2">
                      {formatDuration(song.duration)}
                    </span>
                    {/* Action */}
                    {isAdding ? (
                      <Loader2 className="w-4 h-4 text-spotify-muted animate-spin shrink-0" />
                    ) : isAdded ? (
                      <Check className="w-4 h-4 text-spotify-green shrink-0" />
                    ) : (
                      <Plus className="w-4 h-4 text-spotify-muted shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-5 py-8 text-center">
                <Music className="w-8 h-8 text-spotify-muted/30 mx-auto mb-2" />
                <p className="text-sm text-spotify-muted">
                  No songs found for &quot;{debouncedQuery}&quot;
                </p>
              </div>
            )
          ) : (
            <div className="px-5 py-8 text-center">
              <Search className="w-8 h-8 text-spotify-muted/30 mx-auto mb-2" />
              <p className="text-sm text-spotify-muted">
                Type to search for songs
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
