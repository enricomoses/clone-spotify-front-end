import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import useSWR from 'swr';
import {
  Play,
  User,
  MapPin,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useAuthStore } from '@/stores/useAuthStore';
import SongList from '@/components/song/SongList';
import AlbumCard from '@/components/album/AlbumCard';
import FollowButton from '@/components/social/FollowButton';
import ShareButton from '@/components/social/ShareButton';
import { BannerSkeleton } from '@/components/ui/SkeletonCard';
import { formatDate } from '@/utils/formatDuration';
import type { Artist, ArtistGallery, Concert } from '@/types';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { useToastStore } from '@/components/ui/Toast';

type ArtistTab = 'songs' | 'albums' | 'concerts' | 'gallery';

export default function ArtistProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const playSong = usePlayerStore((s) => s.playSong);
  const { requireAuth, user } = useRequireAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const addToast = useToastStore((s) => s.addToast);
  const [activeTab, setActiveTab] = useState<ArtistTab>('songs');

  const { data: artist, isLoading } = useSWR<Artist>(
    id ? `/artists/${id}` : null,
    fetcher,
  );

  const { data: gallery } = useSWR<ArtistGallery[]>(
    id ? `/artists/${id}/gallery` : null,
    fetcher,
  );

  const { data: concerts } = useSWR<Concert[]>(
    id ? `/artists/${id}/concerts` : null,
    fetcher,
  );

  if (isLoading || !artist) return <BannerSkeleton />;

  const handlePlayAll = () => {
    requireAuth(() => {
      if (artist.songs && artist.songs.length > 0) {
        playSong(artist.songs[0], artist.songs);
      }
    });
  };

  // Check if current user follows this artist
  const isFollowing =
    user?.followed_artists?.some((a) => a.id_artist === artist.id_artist) ||
    false;

  const handleFollow = async () => {
    if (!user) return;
    try {
      await api.post(`/users/${user.id_user}/follow-artist`, {
        artist_id: artist.id_artist,
      });
      await refreshUser();
      addToast('Berhasil mengikuti artis', 'success');
    } catch (e) {
      console.error('Failed to follow artist', e);
      addToast('Gagal mengikuti artis', 'error');
      throw e;
    }
  };

  const handleUnfollow = async () => {
    if (!user) return;
    try {
      await api.post(
        `/users/${user.id_user}/unfollow-artist/${artist.id_artist}`,
        {
          _method: 'DELETE',
        },
      );
      await refreshUser();
      addToast('Batal mengikuti artis', 'success');
    } catch (e) {
      console.error('Failed to unfollow artist', e);
      addToast('Gagal membatalkan mengikuti artis', 'error');
      throw e;
    }
  };


  const upcomingConcerts = (concerts || artist.concerts || []).filter(
    (c) => new Date(c.event_at) > new Date(),
  );
  const pastConcerts = (concerts || artist.concerts || []).filter(
    (c) => new Date(c.event_at) <= new Date(),
  );
  const galleryData = gallery || artist.galleries || [];

  const tabs: { key: ArtistTab; label: string; count?: number }[] = [
    { key: 'songs', label: 'Popular Songs', count: artist.songs?.length },
    { key: 'albums', label: 'Discography', count: artist.albums?.length },
    {
      key: 'concerts',
      label: 'Concerts',
      count: (concerts || artist.concerts)?.length,
    },
    { key: 'gallery', label: 'Gallery', count: galleryData.length },
  ];

  return (
    <>
      <Head>
        <title>{artist.name} — Spotify Clone</title>
        <meta
          name="description"
          content={artist.bio || `Artist profile for ${artist.name}`}
        />
      </Head>

      <div className="-mt-[60px]">
        {/* Banner — responsive: stacked on mobile */}
        <div
          className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 px-4 sm:px-8 pt-20 sm:pt-24 pb-6 sm:pb-8"
          style={{
            background:
              'linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), linear-gradient(135deg, #1e3a5f 0%, #0d1117 100%)',
            minHeight: '300px',
          }}
        >
          {/* Artist Image (circular) */}
          <div className="w-32 h-32 sm:w-44 md:w-52 sm:h-44 md:h-52 shrink-0 rounded-full overflow-hidden shadow-2xl shadow-black/50">
            {artist.profile_picture ? (
              <img
                src={artist.profile_picture}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-spotify-card flex items-center justify-center">
                <User className="w-12 sm:w-16 h-12 sm:h-16 text-spotify-muted" />
              </div>
            )}
          </div>

          {/* Artist Info */}
          <div className="flex flex-col items-center sm:items-start justify-end text-center sm:text-left">
            <p className="text-xs sm:text-sm font-bold uppercase text-white/80 mb-1">
              Artist
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-2 sm:mb-4 leading-tight">
              {artist.name}
            </h1>
            {artist.bio && (
              <p className="text-xs sm:text-sm text-white/70 max-w-lg line-clamp-2">
                {artist.bio}
              </p>
            )}
            {/* Social Links */}
            {(artist.instagram ||
              artist.facebook ||
              artist.wikipedia ||
              artist.x) && (
              <div className="flex gap-3 mt-3 flex-wrap justify-center sm:justify-start">
                {artist.instagram && (
                  <a
                    href={artist.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {artist.facebook && (
                  <a
                    href={artist.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    Facebook
                  </a>
                )}
                {artist.x && (
                  <a
                    href={artist.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    X / Twitter
                  </a>
                )}
                {artist.wikipedia && (
                  <a
                    href={artist.wikipedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    Wikipedia
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Controls + Content */}
        <div className="relative">
          <div
            className="absolute inset-0 h-60"
            style={{
              background: 'linear-gradient(rgba(0,0,0,.6), #121212)',
            }}
          />

          <div className="relative z-10 px-4 sm:px-8 py-6">
            {/* Play + Follow + Share */}
            <div className="flex items-center gap-4 sm:gap-6 mb-6">
              <button
                onClick={handlePlayAll}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-spotify-green rounded-full flex items-center justify-center hover:scale-110 hover:bg-spotify-green-bright transition-all shadow-lg"
                aria-label="Play all"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-black fill-current ml-0.5" />
              </button>
              <FollowButton
                key={`${artist.id_artist}-${isFollowing}`}
                isFollowing={isFollowing}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
              <ShareButton title={artist.name} />
            </div>

            {/* Tabs — scrollable on mobile */}
            <div className="flex gap-1 mb-6 sm:mb-8 border-b border-spotify-border/30 overflow-x-auto scrollbar-hidden -mx-4 px-4 sm:mx-0 sm:px-0">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'px-3 sm:px-5 py-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap',
                    activeTab === tab.key
                      ? 'text-white'
                      : 'text-spotify-muted hover:text-white',
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1 sm:ml-1.5 text-[10px] sm:text-xs text-spotify-muted">
                      ({tab.count})
                    </span>
                  )}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-spotify-green rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content: Songs */}
            {activeTab === 'songs' &&
              artist.songs &&
              artist.songs.length > 0 && (
                <div className="max-w-4xl">
                  <SongList
                    songs={artist.songs}
                    showAlbum={true}
                    showHeader={true}
                  />
                </div>
              )}
            {activeTab === 'songs' &&
              (!artist.songs || artist.songs.length === 0) && (
                <p className="text-spotify-muted text-sm py-8 text-center">
                  No songs available.
                </p>
              )}

            {/* Tab Content: Albums */}
            {activeTab === 'albums' && (
              <>
                {artist.albums && artist.albums.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {artist.albums.map((album) => (
                      <AlbumCard key={album.id_album} album={album} />
                    ))}
                  </div>
                ) : (
                  <p className="text-spotify-muted text-sm py-8 text-center">
                    No albums yet.
                  </p>
                )}
              </>
            )}

            {/* Tab Content: Concerts */}
            {activeTab === 'concerts' && (
              <div className="space-y-6">
                {upcomingConcerts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">
                      Upcoming
                    </h3>
                    <div className="space-y-3">
                      {upcomingConcerts.map((concert) => (
                        <div
                          key={concert.id_concert}
                          className="flex flex-col sm:flex-row sm:items-center justify-between bg-spotify-card/50 rounded-lg p-4 hover:bg-spotify-card transition-colors gap-3"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-spotify-green/20 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-spotify-green" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                {concert.location}
                              </p>
                              <p className="text-xs text-spotify-muted">
                                {formatDate(concert.event_at)}
                              </p>
                            </div>
                          </div>
                          <a
                            href={concert.ticket_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 px-4 py-2 bg-spotify-green text-black text-xs font-bold rounded-full hover:bg-spotify-green-bright transition-colors self-start sm:self-center"
                          >
                            Buy Tickets
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {pastConcerts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-spotify-muted mb-4">
                      Past Concerts
                    </h3>
                    <div className="space-y-3 opacity-60">
                      {pastConcerts.map((concert) => (
                        <div
                          key={concert.id_concert}
                          className="flex items-center gap-4 bg-spotify-card/30 rounded-lg p-4"
                        >
                          <Calendar className="w-5 h-5 text-spotify-muted shrink-0" />
                          <div>
                            <p className="text-sm text-white">
                              {concert.location}
                            </p>
                            <p className="text-xs text-spotify-muted">
                              {formatDate(concert.event_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {upcomingConcerts.length === 0 && pastConcerts.length === 0 && (
                  <p className="text-spotify-muted text-sm py-8 text-center">
                    No concerts scheduled.
                  </p>
                )}
              </div>
            )}

            {/* Tab Content: Gallery */}
            {activeTab === 'gallery' && (
              <>
                {galleryData.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {galleryData.map((photo) => (
                      <div
                        key={photo.id_gallery}
                        className="aspect-square rounded-lg overflow-hidden bg-spotify-card group relative"
                      >
                        <img
                          src={photo.image_url}
                          alt={photo.description_pict || 'Gallery photo'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {photo.description_pict && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <p className="text-xs text-white">
                              {photo.description_pict}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ImageIcon className="w-12 h-12 text-spotify-muted/30 mb-3" />
                    <p className="text-spotify-muted text-sm">
                      No photos in gallery.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
