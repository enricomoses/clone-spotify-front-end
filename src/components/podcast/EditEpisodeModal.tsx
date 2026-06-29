import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Music, Video, Info } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import AudioUpload from '@/components/ui/AudioUpload';
import VideoUpload from '@/components/ui/VideoUpload';
import api from '@/lib/axios';
import type { Episode } from '@/types';

const editEpisodeSchema = z.object({
  title: z.string().min(1, 'Episode title is required'),
  description: z.string().optional(),
  published_at: z.string().min(1, 'Publish date is required'),
  thumbnail_image: z.string().url('Thumbnail URL is invalid').optional().or(z.literal('')),
});

type EditEpisodeForm = z.infer<typeof editEpisodeSchema>;

interface EditEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: Episode | null;
  onSuccess: () => void;
  userId?: string;
}

export default function EditEpisodeModal({
  isOpen,
  onClose,
  episode,
  onSuccess,
  userId,
}: EditEpisodeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Upload state
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);

  const hasVideo = !!videoUrl;
  const hasAudio = !!audioUrl;
  const effectiveAudioUrl = hasVideo ? videoUrl : audioUrl;
  const effectiveDuration = hasVideo ? videoDuration : audioDuration;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditEpisodeForm>({
    resolver: zodResolver(editEpisodeSchema),
  });

  const thumbnailImage = watch('thumbnail_image');

  // Populate form when episode changes or modal opens
  useEffect(() => {
    if (isOpen && episode) {
      const datePart = episode.published_at ? episode.published_at.substring(0, 10) : '';
      reset({
        title: episode.title,
        description: episode.description || '',
        published_at: datePart,
        thumbnail_image: episode.thumbnail_image || '',
      });

      setAudioUrl(episode.audio_url || '');
      if (episode.video_url) {
        setVideoUrl(episode.video_url);
        setVideoDuration(episode.duration);
        setAudioDuration(0);
      } else {
        setVideoUrl('');
        setVideoDuration(0);
        setAudioDuration(episode.duration);
      }
      setError('');
    }
  }, [isOpen, episode, reset]);

  const handleAudioChange = (url: string, duration: number) => {
    setAudioUrl(url);
    setAudioDuration(duration);
  };

  const handleVideoChange = (url: string, duration: number) => {
    setVideoUrl(url);
    setVideoDuration(duration);
  };

  const formatDur = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: EditEpisodeForm) => {
    if (!episode) return;
    if (!effectiveAudioUrl) {
      setError('Please upload an audio or video file first.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/episodes/${episode.id_episode}`, {
        title: data.title,
        description: data.description || undefined,
        published_at: data.published_at,
        duration: Math.round(effectiveDuration),
        audio_url: effectiveAudioUrl,
        video_url: hasVideo ? videoUrl : undefined,
        thumbnail_image: data.thumbnail_image || undefined,
        id_podcast: episode.id_podcast,
        id_user: userId,
        _method: 'PUT',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Failed to update episode. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Episode" size="lg">
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-1.5">
              Episode Title *
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="Episode title"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green transition-all"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Published At */}
          <div>
            <label className="block text-sm font-semibold text-white mb-1.5">
              Publish Date *
            </label>
            <input
              {...register('published_at')}
              type="date"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-spotify-green transition-all"
            />
            {errors.published_at && (
              <p className="mt-1 text-xs text-red-400">{errors.published_at.message}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-white mb-1.5">
            Description
          </label>
          <textarea
            {...register('description')}
            placeholder="Episode description..."
            rows={3}
            className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green transition-all resize-none"
          />
        </div>

        {/* Audio Upload */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
            <Music className="w-4 h-4 text-spotify-green" />
            Audio File {!hasVideo && '*'}
          </label>
          <AudioUpload
            value={audioUrl}
            onChange={handleAudioChange}
            folder="episodes"
          />
          {audioDuration > 0 && !hasVideo && (
            <p className="mt-2 text-xs text-spotify-muted">
              Detected duration: <span className="text-white font-medium">{formatDur(audioDuration)}</span>
            </p>
          )}
          {hasVideo && hasAudio && (
            <div className="mt-2 flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-300">
                Video has been uploaded. Audio URL will automatically use the video URL.
              </p>
            </div>
          )}
        </div>

        {/* Video Upload */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
            <Video className="w-4 h-4 text-purple-400" />
            Video File (Optional)
          </label>
          <VideoUpload
            value={videoUrl}
            onChange={handleVideoChange}
            folder="episodes"
          />
          {videoDuration > 0 && (
            <p className="mt-2 text-xs text-spotify-muted">
              Video duration: <span className="text-white font-medium">{formatDur(videoDuration)}</span>
            </p>
          )}
        </div>

        {/* Duration display */}
        {effectiveDuration > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-spotify-card/50 border border-spotify-border">
            <div className="w-8 h-8 rounded-full bg-spotify-green/10 flex items-center justify-center">
              <span className="text-spotify-green text-sm">⏱</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Duration: {formatDur(effectiveDuration)}
              </p>
              <p className="text-xs text-spotify-muted">
                {hasVideo ? 'Based on video' : 'Based on audio'}
              </p>
            </div>
          </div>
        )}

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-semibold text-white mb-1.5">
            Thumbnail Image (Optional)
          </label>
          <input type="hidden" {...register('thumbnail_image')} />
          <ImageUpload
            value={thumbnailImage}
            onChange={(url) => setValue('thumbnail_image', url, { shouldValidate: true })}
            folder="episodes"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-bold text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !effectiveAudioUrl}
            className="px-5 py-2 text-sm font-bold bg-spotify-green hover:bg-spotify-green-bright text-black rounded-full transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
