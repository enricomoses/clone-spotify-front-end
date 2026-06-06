import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  circular?: boolean;
  className?: string;
}

export default function Avatar({
  src,
  alt = '',
  size = 'md',
  circular = true,
  className,
}: AvatarProps) {
  return (
    <div
      className={cn(
        'bg-spotify-card flex items-center justify-center overflow-hidden shrink-0',
        circular ? 'rounded-full' : 'rounded-md',
        size === 'sm' && 'w-8 h-8',
        size === 'md' && 'w-12 h-12',
        size === 'lg' && 'w-20 h-20',
        size === 'xl' && 'w-32 h-32',
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <User
          className={cn(
            'text-spotify-muted',
            size === 'sm' && 'w-4 h-4',
            size === 'md' && 'w-6 h-6',
            size === 'lg' && 'w-10 h-10',
            size === 'xl' && 'w-16 h-16'
          )}
        />
      )}
    </div>
  );
}
