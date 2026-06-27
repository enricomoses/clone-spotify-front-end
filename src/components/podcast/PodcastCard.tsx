import Link from 'next/link';
import { useRouter } from 'next/router';
import { Mic2 } from 'lucide-react';
import type { Podcast } from '@/types';

interface PodcastCardProps {
  podcast: Podcast;
}

export default function PodcastCard({ podcast }: PodcastCardProps) {
  const router = useRouter();

  const creatorName = podcast.creator?.name || 'Unknown';
  const creatorId = podcast.creator?.id_user || podcast.id_user;

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (creatorId) {
      router.push(`/profile/${creatorId}`);
    }
  };

  return (
    <Link
      href={`/podcast/${podcast.id_podcast}`}
      className="group bg-spotify-card/50 hover:bg-spotify-hover rounded-lg p-4 transition-all duration-300 card-hover block"
    >
      {/* Cover */}
      <div className="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-lg shadow-black/30">
        {podcast.cover_image ? (
          <img
            src={podcast.cover_image}
            alt={podcast.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-700 to-spotify-dark flex items-center justify-center">
            <Mic2 className="w-12 h-12 text-spotify-muted" />
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="text-sm font-bold text-white truncate mb-1">
        {podcast.name}
      </h3>
      <p className="text-xs text-spotify-muted line-clamp-2 leading-relaxed">
        {podcast.about || (
          <>
            By{' '}
            <span
              onClick={handleCreatorClick}
              className="hover:text-white hover:underline transition-colors cursor-pointer"
              role="link"
            >
              {creatorName}
            </span>
          </>
        )}
      </p>
    </Link>
  );
}
