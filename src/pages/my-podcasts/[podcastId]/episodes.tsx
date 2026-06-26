import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR, { mutate } from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Edit3, Trash2, Loader2, Mic, Play, Music, Video, Info } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { withAuth } from '@/utils/withAuth';
import { formatDuration, formatDate } from '@/utils/formatDuration';
import type { Podcast, Episode } from '@/types';
import api from '@/lib/axios';
import Link from 'next/link';
import ImageUpload from '@/components/ui/ImageUpload';
import AudioUpload from '@/components/ui/AudioUpload';
import VideoUpload from '@/components/ui/VideoUpload';
import { useToastStore } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/useAuthStore';

const episodeSchema = z.object({
  title: z.string().min(1, 'Episode title is required'),
  description: z.string().optional(),
  published_at: z.string().min(1, 'Publish date is required'),
  thumbnail_image: z.string().url('Thumbnail URL is invalid').optional().or(z.literal('')),
});

type EpisodeForm = z.infer<typeof episodeSchema>;

function PodcastEpisodesPage() {
  const router = useRouter();
  const { podcastId } = router.query;
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Editing state
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

  // Upload state
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);

  const { data: podcast, isLoading } = useSWR<Podcast>(
    podcastId ? `/podcasts/${podcastId}` : null,
    fetcher
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EpisodeForm>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      published_at: new Date().toISOString().split('T')[0],
    },
  });

  const thumbnailImage = watch('thumbnail_image');

  const hasVideo = !!videoUrl;
  const hasAudio = !!audioUrl;
  const effectiveAudioUrl = hasVideo ? videoUrl : audioUrl;
  const effectiveDuration = hasVideo ? videoDuration : audioDuration;

  const handleAudioChange = (url: string, duration: number) => {
    setAudioUrl(url);
    setAudioDuration(duration);
  };

  const handleVideoChange = (url: string, duration: number) => {
    setVideoUrl(url);
    setVideoDuration(duration);
  };

  const handleToggleForm = () => {
    if (showForm || editingEpisode) {
      setShowForm(false);
      setEditingEpisode(null);
    } else {
      reset({
        title: '',
        description: '',
        published_at: new Date().toISOString().split('T')[0],
        thumbnail_image: '',
      });
      setAudioUrl('');
      setAudioDuration(0);
      setVideoUrl('');
      setVideoDuration(0);
      setShowForm(true);
    }
  };

  const handleStartEdit = (episode: Episode) => {
    setEditingEpisode(episode);
    setShowForm(false);

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
  };

  const handleCancelEdit = () => {
    setEditingEpisode(null);
    reset({
      title: '',
      description: '',
      published_at: new Date().toISOString().split('T')[0],
      thumbnail_image: '',
    });
    setAudioUrl('');
    setAudioDuration(0);
    setVideoUrl('');
    setVideoDuration(0);
  };

  const onSubmit = async (data: EpisodeForm) => {
    if (!effectiveAudioUrl) {
      setError('Please upload an audio or video file first.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const payload = {
      title: data.title,
      description: data.description || undefined,
      published_at: data.published_at,
      duration: Math.round(effectiveDuration),
      audio_url: effectiveAudioUrl,
      video_url: hasVideo ? videoUrl : undefined,
      thumbnail_image: data.thumbnail_image || undefined,
      id_podcast: podcastId,
      id_user: user?.id_user,
    };

    try {
      if (editingEpisode) {
        await api.post(`/episodes/${editingEpisode.id_episode}`, {
          ...payload,
          _method: 'PUT',
        });
        addToast('Episode updated successfully!', 'success');
        setEditingEpisode(null);
      } else {
        await api.post('/episodes', payload);
        addToast('Episode uploaded successfully!', 'success');
        setShowForm(false);
      }
      mutate(`/podcasts/${podcastId}`);
      reset({
        title: '',
        description: '',
        published_at: new Date().toISOString().split('T')[0],
        thumbnail_image: '',
      });
      setAudioUrl('');
      setAudioDuration(0);
      setVideoUrl('');
      setVideoDuration(0);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to save episode. Please try again.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (episodeId: string) => {
    if (!confirm('Delete this episode?')) return;
    setDeletingId(episodeId);
    try {
      const episode = episodes.find((e) => e.id_episode === episodeId);
      if (episode && episode.thumbnail_image) {
        try {
          await api.post('/media/delete', {
            image_url: episode.thumbnail_image,
            _method: 'DELETE',
          });
        } catch (cloudinaryErr) {
          console.warn('Failed to delete episode thumbnail from Cloudinary:', cloudinaryErr);
        }
      }

      if (episode) {
        if (episode.video_url) {
          try {
            await api.post('/media/video/delete', {
              video_url: episode.video_url,
              _method: 'DELETE',
            });
          } catch (e) {
            console.warn('Failed to delete episode video from Cloudinary:', e);
          }
        }
        if (episode.audio_url && episode.audio_url !== episode.video_url) {
          try {
            await api.post('/media/audio/delete', {
              audio_url: episode.audio_url,
              _method: 'DELETE',
            });
          } catch (e) {
            console.warn('Failed to delete episode audio from Cloudinary:', e);
          }
        }
      }

      await api.post(`/episodes/${episodeId}`, {
        _method: 'DELETE',
        id_user: user?.id_user,
      });
      addToast('Episode deleted successfully!', 'success');
      mutate(`/podcasts/${podcastId}`);
    } catch (e: any) {
      console.error('Failed to delete episode', e);
      addToast(e.response?.data?.message || 'Failed to delete episode. Please try again.', 'error');
    } finally {
      setDeletingId(null);
    }
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

  if (isLoading || !podcast) return (
    <div className="px-6 pb-8 max-w-4xl mx-auto">
      {/* Header Skeleton */}
      <div className="pt-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-spotify-muted mb-4">
          <ArrowLeft className="w-4 h-4 animate-pulse" />
          <div className="h-4 w-36 bg-spotify-card/80 rounded animate-pulse" />
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-spotify-card/80 animate-pulse shrink-0" />
          <div>
            <div className="h-7 w-48 bg-spotify-card/80 rounded animate-pulse mb-2" />
            <div className="h-4 w-20 bg-spotify-card/80 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="mb-6">
        <div className="h-10 w-48 bg-spotify-card/80 rounded-full animate-pulse" />
      </div>

      {/* Episodes List Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 bg-spotify-card/30 rounded-lg p-4"
          >
            <div className="w-8 h-4 bg-spotify-card/50 rounded animate-pulse mx-auto" />
            <div className="w-12 h-12 rounded-md bg-spotify-card/80 animate-pulse shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-4 w-1/3 bg-spotify-card/80 rounded animate-pulse mb-2" />
              <div className="h-3 w-1/4 bg-spotify-card/80 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-spotify-card/50 rounded animate-pulse" />
              <div className="w-8 h-8 bg-spotify-card/50 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const episodes = podcast.episodes || [];
  const isFormVisible = showForm || !!editingEpisode;

  return (
    <>
      <Head>
        <title>{podcast.name} — Episodes — Spotify Clone</title>
      </Head>

      <div className="px-6 pb-8 max-w-4xl mx-auto">
        <div className="pt-4 mb-8">
          <Link
            href="/my-podcasts"
            className="flex items-center gap-2 text-sm text-spotify-muted hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Podcasts
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-spotify-card overflow-hidden shrink-0">
              {podcast.cover_image ? (
                <img src={podcast.cover_image} alt={podcast.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-600 to-spotify-dark flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white/60" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{podcast.name}</h1>
              <p className="text-sm text-spotify-muted">{episodes.length} episodes</p>
            </div>
          </div>
        </div>

        {/* Add Episode Button */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={handleToggleForm}
            className="flex items-center gap-2 px-5 py-2.5 bg-spotify-green text-black text-sm font-bold rounded-full hover:bg-spotify-green-bright transition-colors"
          >
            <Plus className="w-4 h-4" />
            {isFormVisible ? 'Close Form' : 'Upload New Episode'}
          </button>
        </div>

        {/* Episode Form */}
        {isFormVisible && (
          <div className="bg-spotify-card/50 border border-spotify-border/20 rounded-xl p-6 mb-8 transition-all">
            <h2 className="text-lg font-bold text-white mb-4">
              {editingEpisode ? `Edit Episode: ${editingEpisode.title}` : 'Upload New Episode'}
            </h2>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-1.5">Episode Title *</label>
                  <input {...register('title')} type="text" placeholder="Episode title"
                    className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green transition-all" />
                  {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-1.5">Publish Date *</label>
                  <input {...register('published_at')} type="date"
                    className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-spotify-green transition-all" />
                  {errors.published_at && <p className="mt-1 text-xs text-red-400">{errors.published_at.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-1.5">Description</label>
                <textarea {...register('description')} placeholder="Episode description..." rows={3}
                  className="w-full bg-spotify-hover border border-spotify-border rounded-md px-4 py-2.5 text-sm text-white placeholder:text-spotify-muted/60 focus:outline-none focus:border-spotify-green transition-all resize-none" />
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

              {/* Thumbnail Image */}
              <div>
                <label className="block text-sm font-semibold text-white mb-1.5">Thumbnail Image (Optional)</label>
                <input type="hidden" {...register('thumbnail_image')} />
                <ImageUpload
                  value={thumbnailImage}
                  onChange={(url) => setValue('thumbnail_image', url, { shouldValidate: true })}
                  folder="episodes"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSubmitting || !effectiveAudioUrl}
                  className="px-6 py-2.5 bg-spotify-green text-black font-bold rounded-full text-sm hover:bg-spotify-green-bright transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? (editingEpisode ? 'Saving...' : 'Uploading...') : (editingEpisode ? 'Save Changes' : 'Upload Episode')}
                </button>
                {editingEpisode && (
                  <button type="button" onClick={handleCancelEdit}
                    className="px-6 py-2.5 bg-transparent border border-spotify-border hover:border-white text-white font-bold rounded-full text-sm transition-colors">
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Episodes List */}
        {episodes.length > 0 ? (
          <div className="space-y-3">
            {episodes.map((episode, idx) => (
              <div
                key={episode.id_episode}
                className="flex items-center gap-4 bg-spotify-card/30 hover:bg-spotify-card/60 rounded-lg p-4 transition-colors"
              >
                <span className="w-8 text-center text-sm font-bold text-spotify-muted">
                  {idx + 1}
                </span>
                <div className="w-12 h-12 rounded-md bg-spotify-card overflow-hidden shrink-0">
                  {episode.thumbnail_image ? (
                    <img src={episode.thumbnail_image} alt={episode.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-700 to-spotify-dark flex items-center justify-center">
                      <Play className="w-4 h-4 text-white/60" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                     <p className="text-sm font-medium text-white truncate">{episode.title}</p>
                    {episode.video_url && (
                      <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold rounded uppercase tracking-wider shrink-0">
                        Video
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-spotify-muted">
                    {formatDate(episode.published_at)} • {formatDuration(episode.duration)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(episode)}
                    disabled={deletingId === episode.id_episode || isSubmitting}
                    className="p-2 text-spotify-muted hover:text-spotify-green transition-colors"
                    title="Edit Episode"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(episode.id_episode)}
                    disabled={deletingId === episode.id_episode}
                    className="p-2 text-spotify-muted hover:text-red-400 transition-colors"
                    title="Delete Episode"
                  >
                    {deletingId === episode.id_episode ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[30vh]">
            <Play className="w-12 h-12 text-spotify-muted/30 mb-3" />
            <p className="text-sm text-spotify-muted">No episodes yet. Upload your first episode!</p>
          </div>
        )}
      </div>
    </>
  );
}

export default withAuth(PodcastEpisodesPage);
