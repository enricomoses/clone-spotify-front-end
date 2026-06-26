// ========================================
// TypeScript Type Definitions
// Spotify Clone — All interfaces
// ========================================

export interface User {
  id_user: string;
  name: string;
  email: string;
  birthday?: string;
  gender?: string;
  country?: string;
  profile_picture?: string;
  followed_playlists?: Playlist[];
  following?: User[];
  followers?: User[];
  followed_artists?: Artist[];
  followed_podcasts?: Podcast[];
  liked_songs?: Song[];
  created_at?: string;
  updated_at?: string;
}

export interface Artist {
  id_artist: string;
  name: string;
  email: string;
  password?: string;
  instagram?: string;
  facebook?: string;
  wikipedia?: string;
  x?: string;
  bio?: string;
  profile_picture?: string;
  albums?: Album[]; // Many-to-Many via artist_album
  songs?: Song[]; // Many-to-Many via song_artist
  concerts?: Concert[]; // Many-to-Many via artist_concert
  galleries?: ArtistGallery[];
  created_at?: string;
  updated_at?: string;
}

export interface Album {
  id_album: string;
  title: string;
  release: string;
  cover_image: string;
  artists?: Artist[]; // Many-to-Many via artist_album
  songs?: Song[]; // One-to-Many
  created_at?: string;
  updated_at?: string;
}

export interface Song {
  id_song: string;
  title: string;
  duration: number; // in seconds
  id_album?: string;
  audio_url: string; // REQUIRED — for Howler.js
  album?: Album;
  artists?: Artist[]; // Many-to-Many via song_artist
  playlists?: Playlist[];
  streaming_histories_count?: number; // from withCount in Discover Weekly
  created_at?: string;
  updated_at?: string;
  last_played_at?: string;
}

export interface Concert {
  id_concert: string;
  location: string;
  location_url?: string;
  event_at: string; // datetime
  ticket_url: string;
  artists?: Artist[]; // Many-to-Many via artist_concert
  created_at?: string;
  updated_at?: string;
}

export interface ArtistGallery {
  id_gallery: string;
  image_url: string;
  description_pict?: string;
  uploaded_at: string;
  id_artist: string;
}

export interface Playlist {
  id_playlist: string;
  name: string;
  description?: string;
  cover_image?: string;
  id_playlist_category?: string;
  id_user?: string;
  category?: PlaylistCategory;
  songs?: Song[];
  collaborators?: PlaylistCollaborator[];
  owner?: User;
  created_at?: string;
  updated_at?: string;
}

export interface PlaylistCollaborator {
  id_user: string;
  name?: string;
  email?: string;
  profile_picture?: string | null;
  birthday?: string;
  gender?: string;
  country?: string;
  pivot: {
    id_playlist: string;
    id_user: string;
    role: 'Owner' | 'Editor' | 'Viewer';
  };
  user?: User;
}

export interface PlaylistCategory {
  id_playlist_category: string;
  name: string;
  cover_image?: string;
  icon?: string;
}

export interface Podcast {
  id_podcast: string;
  name: string;
  about?: string;
  cover_image?: string;
  id_podcast_category?: string;
  id_user: string;
  category?: PodcastCategory;
  creator?: User;
  episodes?: Episode[];
  followers?: User[];
  created_at?: string;
  updated_at?: string;
}

export interface PodcastCategory {
  id_podcast_category: string;
  name: string;
  cover_image?: string;
  icon?: string;
}

export interface Episode {
  id_episode: string;
  title: string;
  description?: string;
  published_at: string;
  duration: number; // in seconds
  audio_url: string;
  video_url?: string;
  thumbnail_image?: string;
  id_podcast: string;
  podcast?: Podcast;
  created_at?: string;
  updated_at?: string;
}

export interface SongStreamingHistory {
  id_stream: string;
  played_at: string;
  play_duration?: number; // null when starting, filled on pause/end
  id_user: string;
  id_song: string;
  user?: User;
  song?: Song;
}

export interface EpisodeStreamingHistory {
  id_stream: string;
  played_at: string;
  play_duration?: number;
  id_user: string;
  id_episode: string;
  user?: User;
  episode?: Episode;
}

// Legacy alias for backward compatibility
export type StreamingHistory = SongStreamingHistory;

// ========================================
// Utility types
// ========================================

export type RepeatMode = 'off' | 'one' | 'all';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
