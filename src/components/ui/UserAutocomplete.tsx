import { useState, useEffect, useRef, useCallback } from 'react';
import useSWR from 'swr';
import { Search, User as UserIcon } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import type { User } from '@/types';

interface UserAutocompleteProps {
  onSelect: (user: User) => void;
  excludeIds?: string[];
  label?: string;
  placeholder?: string;
}

export default function UserAutocomplete({
  onSelect,
  excludeIds = [],
  label = 'Search Users',
  placeholder = 'Search by name or email...',
}: UserAutocompleteProps) {
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

  const { data: allUsers } = useSWR<User[]>('/users', fetcher);

  // Filter users based on query and exclude IDs
  const filteredUsers = (allUsers || []).filter((user) => {
    if (excludeIds.includes(user.id_user)) return false;
    if (!debouncedQuery) return true;
    const q = debouncedQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  const handleSelect = useCallback(
    (user: User) => {
      onSelect(user);
      setQuery('');
      setDebouncedQuery('');
      setIsOpen(false);
    },
    [onSelect]
  );

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-semibold text-white mb-2">
          {label}
        </label>
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
      {isOpen && debouncedQuery.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[#282828] border border-spotify-border/30 rounded-lg shadow-2xl shadow-black/60 max-h-60 overflow-y-auto animate-slide-up">
          {filteredUsers.length > 0 ? (
            filteredUsers.slice(0, 10).map((user) => (
              <button
                key={user.id_user}
                type="button"
                onClick={() => handleSelect(user)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full overflow-hidden bg-spotify-hover shrink-0 ring-1 ring-white/10">
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-spotify-muted" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-spotify-muted truncate">
                    {user.email}
                  </p>
                </div>
                {/* Type badge */}
                <span className="text-[10px] font-semibold text-spotify-muted uppercase tracking-wider px-2 py-0.5 bg-white/5 rounded-full">
                  User
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-spotify-muted">
                No users found for &quot;{debouncedQuery}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
