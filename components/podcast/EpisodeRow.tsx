import { Play, Calendar, Clock } from 'lucide-react';
import { formatDuration, formatDate } from '@/utils/formatDuration';
import type { Episode } from '@/types';

interface EpisodeRowProps {
  episode: Episode;
  onPlay?: (episode: Episode) => void;
}

export default function EpisodeRow({ episode, onPlay }: EpisodeRowProps) {
  return (
    <div className="group flex gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors border-b border-spotify-border/20 last:border-0">
      {/* Thumbnail */}
      <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-spotify-card">
        {episode.thumbnail_image ? (
          <img
            src={episode.thumbnail_image}
            alt={episode.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-spotify-card to-spotify-hover flex items-center justify-center">
            <Play className="w-8 h-8 text-spotify-muted" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white mb-1 line-clamp-1 group-hover:text-spotify-green transition-colors">
            {episode.title}
          </h3>
          <p className="text-sm text-spotify-muted line-clamp-2 leading-relaxed mb-3">
            {episode.description || 'No description available.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Play button */}
          <button
            onClick={() => onPlay?.(episode)}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
            aria-label={`Play ${episode.title}`}
          >
            <Play className="w-4 h-4 text-black fill-current ml-0.5" />
          </button>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-spotify-muted">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(episode.published_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(episode.duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
