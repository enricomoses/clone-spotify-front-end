import { Play, Pause, Calendar, Clock, Video } from 'lucide-react';
import { formatDuration, formatDate } from '@/utils/formatDuration';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { cn } from '@/lib/utils';
import type { Episode } from '@/types';

interface EpisodeRowProps {
  episode: Episode;
}

export default function EpisodeRow({ episode }: EpisodeRowProps) {
  const currentEpisode = usePlayerStore((s) => s.currentEpisode);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playEpisode = usePlayerStore((s) => s.playEpisode);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const isThisPlaying = currentEpisode?.id_episode === episode.id_episode && isPlaying;
  const isThisLoaded = currentEpisode?.id_episode === episode.id_episode;

  const handlePlay = () => {
    if (isThisLoaded) {
      togglePlay();
    } else {
      playEpisode(episode);
    }
  };

  return (
    <div className="group flex gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors border-b border-spotify-border/20 last:border-0">
      {/* Thumbnail */}
      <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-spotify-card relative">
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
        {/* Video badge */}
        {episode.video_url && (
          <div className="absolute top-2 right-2 bg-purple-500/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
            <Video className="w-3 h-3 text-white" />
            <span className="text-[10px] font-semibold text-white">VIDEO</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className={cn(
            'text-base font-bold mb-1 line-clamp-1 transition-colors',
            isThisLoaded ? 'text-spotify-green' : 'text-white group-hover:text-spotify-green'
          )}>
            {episode.title}
          </h3>
          <p className="text-sm text-spotify-muted line-clamp-2 leading-relaxed mb-3">
            {episode.description || 'No description available.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Play button */}
          <button
            onClick={handlePlay}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md',
              isThisPlaying
                ? 'bg-spotify-green text-black'
                : 'bg-white text-black'
            )}
            aria-label={isThisPlaying ? `Pause ${episode.title}` : `Play ${episode.title}`}
          >
            {isThisPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
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
            {episode.video_url && (
              <span className="flex items-center gap-1 text-purple-400">
                <Video className="w-3 h-3" />
                Video
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
