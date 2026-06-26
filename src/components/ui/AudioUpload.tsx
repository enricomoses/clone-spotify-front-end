import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Loader2, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

interface AudioUploadProps {
  value?: string;
  onChange: (url: string, duration: number) => void;
  folder?: string;
  className?: string;
}

export default function AudioUpload({
  value,
  onChange,
  folder,
  className,
}: AudioUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
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
    const validTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/aac',
      'audio/mp4',
      'audio/x-m4a',
      'audio/ogg',
    ];
    // Also check extension as fallback since MIME types can vary
    const validExtensions = ['.mp3', '.wav', '.aac', '.m4a', '.ogg'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
      setError('Format audio harus MP3, WAV, AAC, M4A, atau OGG');
      return false;
    }
    // 4MB limit
    if (file.size > 4 * 1024 * 1024) {
      setError('Ukuran audio maksimal adalah 4MB');
      return false;
    }
    setError(null);
    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setError(null);

    // If there is an existing audio, delete it from Cloudinary first
    if (value) {
      try {
        await api.post('/media/audio/delete', {
          audio_url: value,
          _method: 'DELETE',
        });
      } catch (err) {
        console.warn('Failed to delete old audio from Cloudinary:', err);
      }
    }

    const formData = new FormData();
    formData.append('audio', file);
    if (folder) {
      formData.append('folder', folder);
    }

    try {
      const res = await api.post('/media/audio/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = res.data;
      if (data.secure_url) {
        setFileName(file.name);
        onChange(data.secure_url, data.duration ?? 0);
      } else {
        setError('Failed to get audio URL from server');
      }
    } catch (err: any) {
      console.error('Error uploading audio:', err);
      setError(
        err.response?.data?.message || 'Failed to upload audio. Please try again.'
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
      await api.post('/media/audio/delete', {
        audio_url: value,
        _method: 'DELETE',
      });
      setFileName(null);
      onChange('', 0);
    } catch (err: any) {
      console.error('Error deleting audio:', err);
      setError(
        err.response?.data?.message || 'Failed to delete audio from storage.'
      );
      // Fallback: clear anyway to prevent user blockage
      setFileName(null);
      onChange('', 0);
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  /** Format duration (seconds) to mm:ss for display */
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /** Extract a short display name from a Cloudinary URL or use stored file name */
  const displayName = fileName || (value ? value.split('/').pop()?.split('?')[0] : null);

  return (
    <div className={cn('w-full', className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".mp3,.wav,.aac,.m4a,.ogg,audio/mpeg,audio/wav,audio/aac,audio/mp4,audio/x-m4a,audio/ogg"
      />

      {value ? (
        <div className="flex items-center gap-4 p-4 rounded-lg border border-spotify-border bg-spotify-card/50 transition-all">
          {/* Audio icon */}
          <div className="shrink-0 w-12 h-12 rounded-lg bg-spotify-green/10 border border-spotify-green/20 flex items-center justify-center">
            <Music className="w-5 h-5 text-spotify-green" />
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate" title={displayName || ''}>
              {displayName || 'Audio file'}
            </p>
            <p className="text-xs text-spotify-muted mt-0.5">Audio uploaded successfully</p>
          </div>

          {/* Actions */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={triggerSelect}
              disabled={isUploading || isDeleting}
              className="px-3 py-1.5 bg-spotify-hover text-white rounded-full text-xs font-semibold hover:bg-spotify-hover/80 transition-colors"
            >
              Ubah
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isUploading || isDeleting}
              className="p-1.5 bg-red-600/20 text-red-400 rounded-full hover:bg-red-600/40 transition-colors flex items-center justify-center"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
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
            'w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 select-none bg-spotify-card/30 border-spotify-border hover:border-spotify-green hover:bg-spotify-card/50',
            isDragging && 'border-spotify-green bg-spotify-green/5 scale-[1.01]',
            isUploading && 'pointer-events-none opacity-60'
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-spotify-green animate-spin" />
              <p className="text-sm text-white font-medium">Uploading audio...</p>
              <p className="text-xs text-spotify-muted">
                Ini mungkin memerlukan beberapa saat
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-spotify-hover text-spotify-muted transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white font-semibold mb-1">
                  Seret & taruh file audio di sini
                </p>
                <p className="text-xs text-spotify-muted">
                  Atau klik untuk memilih file dari komputer Anda
                </p>
              </div>
              <p className="text-[10px] text-spotify-muted/70">
                Mendukung MP3, WAV, AAC, M4A, OGG (Maks. 4MB)
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
