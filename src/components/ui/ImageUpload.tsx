import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder,
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await uploadFile(file);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await uploadFile(file);
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Format gambar harus JPEG, PNG, JPG, GIF, atau WebP');
      return false;
    }
    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal adalah 5MB');
      return false;
    }
    setError(null);
    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setError(null);

    // If there is an existing image, delete it from Cloudinary first
    if (value) {
      try {
        await api.post('/media/delete', {
          image_url: value,
          _method: 'DELETE',
        });
      } catch (err) {
        console.warn('Failed to delete old image from Cloudinary:', err);
      }
    }

    const formData = new FormData();
    formData.append('image', file);
    if (folder) {
      formData.append('folder', folder);
    }

    try {
      const res = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = res.data;
      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        setError('Gagal mendapatkan URL gambar dari server');
      }
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(
        err.response?.data?.message || 'Gagal mengunggah gambar. Silakan coba lagi.'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!value) return;

    setIsDeleting(true);
    setError(null);

    try {
      await api.post('/media/delete', {
        image_url: value,
        _method: 'DELETE',
      });
      onChange('');
    } catch (err: any) {
      console.error('Error deleting image:', err);
      setError(
        err.response?.data?.message || 'Gagal menghapus gambar dari penyimpanan.'
      );
      // Fallback: clear anyway to prevent user blockage
      onChange('');
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
      />

      {value ? (
        <div className="relative group w-48 h-48 rounded-lg overflow-hidden border border-spotify-border bg-spotify-card shadow-xl transition-all">
          <img
            src={value}
            alt="Uploaded Preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <button
              type="button"
              onClick={triggerSelect}
              disabled={isUploading || isDeleting}
              className="px-4 py-1.5 bg-white text-black rounded-full text-xs font-bold hover:scale-105 transition-transform"
            >
              Ubah Gambar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isUploading || isDeleting}
              className="px-4 py-1.5 bg-red-600 text-white rounded-full text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1"
            >
              {isDeleting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <X className="w-3 h-3" />
              )}
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerSelect}
          className={cn(
            'w-full max-w-md aspect-video md:aspect-[2/1] rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 select-none bg-spotify-card/30 border-spotify-border hover:border-spotify-green hover:bg-spotify-card/50',
            isDragging && 'border-spotify-green bg-spotify-green/5 scale-[1.01]',
            isUploading && 'pointer-events-none opacity-60'
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-spotify-green animate-spin" />
              <p className="text-sm text-white font-medium">Mengunggah...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-spotify-hover text-spotify-muted group-hover:text-white transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white font-semibold mb-1">
                  Seret & taruh gambar di sini
                </p>
                <p className="text-xs text-spotify-muted">
                  Atau klik untuk memilih file dari komputer Anda
                </p>
              </div>
              <p className="text-[10px] text-spotify-muted/70">
                Mendukung JPG, JPEG, PNG, GIF, WebP (Maks. 5MB)
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-400 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
