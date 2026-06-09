import { useState } from 'react';
import { Trash2, X, ZoomIn } from 'lucide-react';
import type { ArtistGallery } from '@/types';

interface GalleryGridProps {
  photos: ArtistGallery[];
  onDelete?: (photo: ArtistGallery) => void;
  canManage?: boolean;
}

export default function GalleryGrid({ photos, onDelete, canManage = false }: GalleryGridProps) {
  const [lightboxPhoto, setLightboxPhoto] = useState<ArtistGallery | null>(null);

  if (photos.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-spotify-muted text-sm">
        No photos in the gallery yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo) => (
          <div
            key={photo.id_gallery}
            className="group relative aspect-square rounded-lg overflow-hidden bg-spotify-card cursor-pointer"
            onClick={() => setLightboxPhoto(photo)}
          >
            <img
              src={photo.images_url}
              alt={photo.description_pict || 'Gallery photo'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Delete button */}
            {canManage && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(photo);
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            onClick={() => setLightboxPhoto(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxPhoto.images_url}
            alt={lightboxPhoto.description_pict || 'Gallery photo'}
            className="max-w-full max-h-[85vh] object-contain rounded-lg animate-fade-in"
          />
          {lightboxPhoto.description_pict && (
            <p className="absolute bottom-8 text-white/80 text-sm text-center">
              {lightboxPhoto.description_pict}
            </p>
          )}
        </div>
      )}
    </>
  );
}
