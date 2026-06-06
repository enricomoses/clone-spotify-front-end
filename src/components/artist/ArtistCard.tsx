import Link from 'next/link';
import { User } from 'lucide-react';
import type { Artist } from '@/types';

interface ArtistCardProps {
  artist: Artist;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link
      href={`/artist/${artist.id_artist}`}
      className="block bg-spotify-card/60 hover:bg-spotify-hover rounded-lg p-4 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 group"
    >
      {/* Circular Image */}
      <div className="relative aspect-square mb-4 rounded-full overflow-hidden bg-spotify-dark shadow-xl mx-auto">
        {artist.profile_picture ? (
          <img
            src={artist.profile_picture}
            alt={artist.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-12 h-12 text-spotify-muted" />
          </div>
        )}
      </div>

      {/* Info */}
      <p className="text-sm font-bold text-white truncate text-center mb-1">
        {artist.name}
      </p>
      <p className="text-xs text-spotify-muted text-center">Artist</p>
    </Link>
  );
}
