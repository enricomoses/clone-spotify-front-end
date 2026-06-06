// ========================================
// TypeScript Type Definitions
// Spotify Clone — All interfaces
// ========================================

export interface User {
  id_user: string;
  name: string;
  email: string;
  password?: string;
  birthday?: string;
  gender?: string;
  country?: string;
  profile_picture?: string;
  followedPlaylists?: Playlist[];
  following?: User[];
  followers?: User[];
  likedSongs?: Song[];
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
  albums?: Album[];
  songs?: Song[];
  gallery?: ArtistGallery[];
  concerts?: Concert[];
  created_at?: string;
  updated_at?: string;
}

export interface Album {
  id_album: string;
  title: string;
  release: string;
  cover_image: string;
  artists?: Artist[];
  songs?: Song[];
  created_at?: string;
  updated_at?: string;
}

export interface Song {
  id_song: string;
  title: string;
  duration: number; // in seconds
  id_album?: string;
  album?: Album;
  artists?: Artist[];
  audio_url?: string;
  created_at?: string;
  updated_at?: string;
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
  id_playlist: string;
  id_user: string;
  role: 'editor' | 'viewer';
  user?: User;
}

export interface PlaylistCategory {
  id_playlist_category: string;
  name: string;
  cover_image: string;
  icon: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface PodcastCategory {
  id_podcast_category: string;
  name: string;
  cover_image: string;
  icon: string;
}

export interface Episode {
  id_episode: string;
  title: string;
  description?: string;
  published_at: string;
  duration: number;
  audio_url: string;
  video_url?: string;
  thumbnail_image?: string;
  id_podcast: string;
  podcast?: Podcast;
  created_at?: string;
  updated_at?: string;
}

export interface StreamingHistory {
  id_stream: string;
  played_at: string;
  play_duration?: number;
  id_user: string;
  id_song: string;
  user?: User;
  song?: Song;
}

export interface Concert {
  id_concert: string;
  location: string;
  location_url?: string;
  event_at: string;
  ticket_url: string;
}

export interface ArtistGallery {
  id_gallery: string;
  image_url: string;
  description_pict?: string;
  uploaded_at: string;
  id_artist: string;
}

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
