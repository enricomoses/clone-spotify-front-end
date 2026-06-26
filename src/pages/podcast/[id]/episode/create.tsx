import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Music, Video, Info } from 'lucide-react';
import { withAuth } from '@/utils/withAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/axios';
import ImageUpload from '@/components/ui/ImageUpload';
import AudioUpload from '@/components/ui/AudioUpload';
import VideoUpload from '@/components/ui/VideoUpload';
import { useToastStore } from '@/components/ui/Toast';

const createEpisodeSchema = z.object({
  title: z.string().min(1, 'Episode title is required'),
  description: z.string().optional(),
  published_at: z.string().min(1, 'Publish date is required'),
  thumbnail_image: z.string().url('Thumbnail URL is invalid').optional().or(z.literal('')),
});

type CreateEpisodeForm = z.infer<typeof createEpisodeSchema>;

function CreateEpisodePage() {
  const router = useRouter();
  const { id } = router.query; // podcast ID
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload state — managed outside react-hook-form
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);

  // Derived: which media type is the primary source?
  const hasVideo = !!videoUrl;
  const hasAudio = !!audioUrl;

  // The effective audio_url sent to the API:
  // If video is uploaded, audio_url = video_url (video contains audio track)
  // Otherwise, use the uploaded audio_url
  const effectiveAudioUrl = hasVideo ? videoUrl : audioUrl;
  const effectiveDuration = hasVideo ? videoDuration : audioDuration;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEpisodeForm>({
    resolver: zodResolver(createEpisodeSchema),
    defaultValues: {
      published_at: new Date().toISOString().split('T')[0],
    },
  });

  const thumbnailImage = watch('thumbnail_image');

  const handleAudioChange = (url: string, duration: number) => {
    setAudioUrl(url);
    setAudioDuration(duration);
  };

  const handleVideoChange = (url: string, duration: number) => {
    setVideoUrl(url);
    setVideoDuration(duration);
  };

  const onSubmit = async (data: CreateEpisodeForm) => {
    // Validate that at least one media is uploaded
    if (!effectiveAudioUrl) {
      setError('Please upload an audio or video file first.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        title: data.title,
        description: data.description || undefined,
        published_at: data.published_at,
        duration: Math.round(effectiveDuration),
        audio_url: effectiveAudioUrl,
        video_url: hasVideo ? videoUrl : undefined,
        thumbnail_image: data.thumbnail_image || undefined,
        id_podcast: id,
        id_user: user?.id_user,
      };

      await api.post('/episodes', payload);
      addToast('Episode uploaded successfully!', 'success');
      router.push(`/podcast/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload episode. Please try again.');
      addToast('Failed to upload episode. Please try again.', 'error');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Format duration (seconds) to mm:ss for display */
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

  return (
    <>
      <Head>
        <title>Upload Episode — Spotify Clone</title>
      </Head>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Episode</h1>
          <p className="text-sm text-spotify-muted">
            Add a new episode to your podcast. Upload audio or video to start.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Episode Title *
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="Enter episode title"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              placeholder="Episode description"
              rows={4}
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all resize-none"
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
                  Video has been uploaded. Audio URL will automatically use the video URL because the video already contains the audio track. Separately uploaded audio will be ignored.
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
            <p className="text-xs text-spotify-muted mb-3">
              Upload video for a video podcast. If video is uploaded, audio will automatically be taken from the video.
            </p>
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
            <div className="flex items-center gap-3 p-4 rounded-lg bg-spotify-card/50 border border-spotify-border">
              <div className="w-10 h-10 rounded-full bg-spotify-green/10 flex items-center justify-center">
                <span className="text-spotify-green text-lg">⏱</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Episode Duration: {formatDur(effectiveDuration)}
                </p>
                <p className="text-xs text-spotify-muted">
                  {hasVideo ? 'Based on video duration' : 'Based on audio duration'}
                </p>
              </div>
            </div>
          )}

          {/* Published At */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Publish Date *
            </label>
            <input
              {...register('published_at')}
              type="date"
              className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all"
            />
            {errors.published_at && (
              <p className="mt-1 text-xs text-red-400">
                {errors.published_at.message}
              </p>
            )}
          </div>

          {/* Thumbnail Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Thumbnail Image (Optional)
            </label>
            <input type="hidden" {...register('thumbnail_image')} />
            <ImageUpload
              value={thumbnailImage}
              onChange={(url) => setValue('thumbnail_image', url, { shouldValidate: true })}
              folder="episodes"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-outline text-sm py-2.5 px-8"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !effectiveAudioUrl}
              className="btn-spotify text-sm py-2.5 px-8 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Uploading...' : 'Upload Episode'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default withAuth(CreateEpisodePage);
