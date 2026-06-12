import { cn } from '@/lib/utils';

// Base skeleton pulse block
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-spotify-card/80',
        className
      )}
    />
  );
}

// Card skeleton (Album, Playlist, Podcast)
export function CardSkeleton() {
  return (
    <div className="bg-spotify-card/40 rounded-lg p-4">
      <Skeleton className="aspect-square w-full rounded-md mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

// Artist card skeleton (circular image)
export function ArtistCardSkeleton() {
  return (
    <div className="bg-spotify-card/40 rounded-lg p-4">
      <Skeleton className="aspect-square w-full rounded-full mb-4 mx-auto" />
      <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-3 w-1/3 mx-auto" />
    </div>
  );
}

// Song row skeleton
export function SongRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-2">
      <Skeleton className="w-4 h-4 rounded-sm" />
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Skeleton className="w-10 h-10 rounded shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-2/3 mb-1.5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-20 hidden md:block" />
      <Skeleton className="h-3 w-10" />
    </div>
  );
}

// Banner skeleton (Artist, Playlist, Profile detail pages)
export function BannerSkeleton() {
  return (
    <div className="-mt-[60px]">
      <div
        className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 px-4 sm:px-8 pt-24 pb-8"
        style={{
          background:
            'linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), linear-gradient(135deg, #282828 0%, #181818 100%)',
          minHeight: '340px',
        }}
      >
        <Skeleton className="w-32 h-32 sm:w-52 sm:h-52 rounded-full shrink-0" />
        <div className="flex flex-col items-center sm:items-start gap-3 flex-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 sm:h-14 w-48 sm:w-72" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="px-4 sm:px-8 py-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <SongRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Quick Play grid skeleton (home page top section)
export function QuickPlaySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center bg-white/5 rounded-md overflow-hidden">
          <Skeleton className="w-16 h-16 shrink-0 rounded-none" />
          <Skeleton className="h-4 w-24 mx-4" />
        </div>
      ))}
    </div>
  );
}

// Concert card skeleton
export function ConcertCardSkeleton() {
  return (
    <div className="bg-spotify-card/40 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  );
}

// Configurable grid of card skeletons
interface GridSkeletonProps {
  count?: number;
  type?: 'card' | 'artist' | 'concert';
  className?: string;
}

export function GridSkeleton({
  count = 6,
  type = 'card',
  className,
}: GridSkeletonProps) {
  const Component =
    type === 'artist'
      ? ArtistCardSkeleton
      : type === 'concert'
        ? ConcertCardSkeleton
        : CardSkeleton;

  return (
    <div
      className={cn(
        type === 'concert'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}

// Home page full skeleton
export function HomePageSkeleton() {
  return (
    <div className="px-4 sm:px-6 pb-8">
      {/* Greeting */}
      <div className="mb-8 pt-4">
        <Skeleton className="h-8 w-64 mb-2" />
      </div>

      {/* Quick Play */}
      <QuickPlaySkeleton />

      {/* Section skeletons */}
      {[1, 2, 3].map((section) => (
        <section key={section} className="mb-10">
          <Skeleton className="h-7 w-48 mb-5" />
          <GridSkeleton count={6} />
        </section>
      ))}
    </div>
  );
}

// Profile page skeleton
export function ProfileSkeleton() {
  return (
    <div className="-mt-[60px]">
      <div
        className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 px-4 sm:px-8 pt-24 pb-8"
        style={{
          background:
            'linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), linear-gradient(135deg, #282828 0%, #181818 100%)',
          minHeight: '340px',
        }}
      >
        <Skeleton className="w-32 h-32 sm:w-52 sm:h-52 rounded-full shrink-0" />
        <div className="flex flex-col items-center sm:items-start gap-3">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-12 sm:h-16 w-48 sm:w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="px-4 sm:px-8 py-8">
        <Skeleton className="h-7 w-24 mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
