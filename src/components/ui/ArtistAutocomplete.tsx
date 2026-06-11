import { useState, useEffect, useRef, useCallback } from 'react';
import useSWR from 'swr';
import { Search, X, Music2 } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import type { Artist } from '@/types';

interface ArtistAutocompleteProps {
  selectedArtists: Artist[];
  onAdd: (artist: Artist) => void;
  onRemove: (artistId: string) => void;
  excludeIds?: string[];
  label?: string;
  placeholder?: string;
  /** If set, this artist ID cannot be removed (e.g. the current logged-in artist) */
  lockedArtistId?: string;
}

export default function ArtistAutocomplete({
  selectedArtists,
  onAdd,
  onRemove,
  excludeIds = [],
  label = 'Collaborating Artists',
  placeholder = 'Search artists...',
  lockedArtistId,
}: ArtistAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: allArtists } = useSWR<Artist[]>('/artists', fetcher);

  // Filter artists based on query and exclude already selected
  const filteredArtists = (allArtists || []).filter((artist) => {
    // Exclude already selected
    if (selectedArtists.some((s) => s.id_artist === artist.id_artist)) return false;
    // Exclude specific IDs
    if (excludeIds.includes(artist.id_artist)) return false;
    // Filter by query
    if (!debouncedQuery) return true;
    const q = debouncedQuery.toLowerCase();
    return (
      artist.name.toLowerCase().includes(q) ||
      artist.email.toLowerCase().includes(q)
    );
  });

  const handleSelect = useCallback(
    (artist: Artist) => {
      onAdd(artist);
      setQuery('');
      setDebouncedQuery('');
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [onAdd]
  );

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-semibold text-white mb-2">
          {label}
        </label>
      )}

      {/* Selected artists chips */}
      {selectedArtists.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedArtists.map((artist) => (
            <span
              key={artist.id_artist}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-spotify-green/15 border border-spotify-green/30 rounded-full text-sm text-white group transition-all hover:bg-spotify-green/25"
            >
              {/* Avatar */}
              <span className="w-5 h-5 rounded-full overflow-hidden bg-spotify-hover shrink-0">
                {artist.profile_picture ? (
                  <img
                    src={artist.profile_picture}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-3 h-3 text-spotify-muted" />
                  </span>
                )}
              </span>
              <span className="font-medium">{artist.name}</span>
              {artist.id_artist === lockedArtistId ? (
                <span className="text-[10px] text-spotify-green font-bold uppercase tracking-wider">
                  You
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onRemove(artist.id_artist)}
                  className="ml-0.5 p-0.5 rounded-full hover:bg-white/20 transition-colors"
                  aria-label={`Remove ${artist.name}`}
                >
                  <X className="w-3.5 h-3.5 text-white/60 hover:text-white" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-spotify-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-spotify-hover border border-spotify-border rounded-md pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
          autoComplete="off"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#282828] border border-spotify-border/30 rounded-lg shadow-2xl shadow-black/60 max-h-60 overflow-y-auto animate-slide-up">
          {filteredArtists.length > 0 ? (
            filteredArtists.slice(0, 10).map((artist) => (
              <button
                key={artist.id_artist}
                type="button"
                onClick={() => handleSelect(artist)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full overflow-hidden bg-spotify-hover shrink-0 ring-1 ring-white/10">
                  {artist.profile_picture ? (
                    <img
                      src={artist.profile_picture}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 className="w-4 h-4 text-spotify-muted" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {artist.name}
                  </p>
                  <p className="text-xs text-spotify-muted truncate">
                    {artist.email}
                  </p>
                </div>
                {/* Type badge */}
                <span className="text-[10px] font-semibold text-spotify-muted uppercase tracking-wider px-2 py-0.5 bg-white/5 rounded-full">
                  Artist
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-spotify-muted">
                {debouncedQuery
                  ? `No artists found for "${debouncedQuery}"`
                  : 'Type to search artists'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
