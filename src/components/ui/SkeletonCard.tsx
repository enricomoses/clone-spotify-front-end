import { cn } from '@/lib/utils';

// Base skeleton pulse block
function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-spotify-card/80',
        className
      )}
      style={style}
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

      {/* Discover Weekly Skeleton */}
      <section className="mb-10">
        <Skeleton className="h-7 w-48 mb-5" />
        <GridSkeleton count={5} className="xl:grid-cols-5" />
      </section>

      {/* Section skeletons */}
      {[1, 2].map((section) => (
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

// Artist dashboard page skeleton
export function ArtistDashboardSkeleton() {
  return (
    <div>
      {/* Greeting */}
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-spotify-card/30 border border-spotify-border/10 rounded-xl p-5"
          >
            <Skeleton className="w-10 h-10 rounded-lg mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        ))}
      </div>

      {/* Top Songs & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Top 5 Songs */}
        <div className="bg-spotify-card/30 border border-spotify-border/20 rounded-xl p-6 space-y-4">
          <Skeleton className="h-6 w-36 mb-6" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="w-6 h-4 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/2 animate-pulse" />
                <Skeleton className="h-3 w-1/3 animate-pulse" />
              </div>
              <Skeleton className="w-8 h-4 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Streaming Chart */}
        <div className="bg-spotify-card/30 border border-spotify-border/20 rounded-xl p-6 space-y-4">
          <Skeleton className="h-6 w-48 mb-6" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 py-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28 animate-pulse" />
                <Skeleton className="h-3.5 w-12 animate-pulse" />
              </div>
              <Skeleton className="h-3.5 w-full rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-spotify-card/20 border border-spotify-border/10 rounded-xl p-5"
          >
            <Skeleton className="w-6 h-6 rounded-md mb-3" />
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-3.5 w-36" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Artist songs list page skeleton
export function ArtistSongsSkeleton() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Table Header Placeholder */}
      <div className="grid grid-cols-[40px_1fr_180px_100px_120px] items-center gap-4 px-4 py-2 border-b border-spotify-border/30 mb-2">
        <Skeleton className="h-3.5 w-4 mx-auto" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-16 ml-auto" />
      </div>

      {/* Rows */}
      <div className="space-y-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[40px_1fr_180px_100px_120px] items-center gap-4 px-4 py-3 rounded-md bg-spotify-card/20 animate-pulse"
          >
            {/* # */}
            <Skeleton className="h-4 w-4 mx-auto" />

            {/* Title */}
            <div className="flex items-center gap-3 min-w-0">
              <Skeleton className="w-10 h-10 rounded shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3.5 w-1/4" />
              </div>
            </div>

            {/* Album */}
            <Skeleton className="h-4 w-28" />

            {/* Duration */}
            <Skeleton className="h-4 w-10" />

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Artist albums list page skeleton
export function ArtistAlbumsSkeleton() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-spotify-card/40 rounded-lg p-4 animate-pulse"
          >
            {/* Cover */}
            <Skeleton className="aspect-square w-full rounded-md mb-4" />
            {/* Info */}
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Artist concerts page skeleton
export function ArtistConcertsSkeleton() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Upcoming Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-spotify-card/50 border border-spotify-border/20 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2 opacity-60">
          {Array.from({ length: 1 }).map((_, i) => (
            <div
              key={i}
              className="bg-spotify-card/30 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Artist analytics page skeleton
export function ArtistAnalyticsSkeleton() {
  return (
    <div>
      {/* Header */}
      <Skeleton className="h-8 w-64 mb-6" />

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { color: 'bg-spotify-green/20' },
          { color: 'bg-blue-400/20' },
          { color: 'bg-orange-400/20' },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-spotify-card/40 border border-spotify-border/20 rounded-xl p-5 animate-pulse"
          >
            <Skeleton className={`w-5 h-5 rounded mb-2 ${item.color}`} />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        ))}
      </div>

      {/* Chart Block */}
      <div className="bg-spotify-card/30 border border-spotify-border/20 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-6 animate-pulse">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-6 w-48" />
        </div>
        {/* Simulating horizontal progress bars for top songs */}
        <div className="space-y-4 animate-pulse">
          {[85, 60, 45, 30, 15].map((width, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <Skeleton className="w-6 h-4 rounded shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
                <div className="w-full h-2.5 bg-spotify-card rounded-full overflow-hidden">
                  <Skeleton className="h-full rounded-full" style={{ width: `${width}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table Block */}
      <div className="bg-spotify-card/30 border border-spotify-border/20 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-spotify-border/20 animate-pulse">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="px-6 py-3 border-b border-spotify-border/20 grid grid-cols-[40px_1fr_100px_100px_100px_100px] gap-4 items-center animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-3 w-12 ${i >= 3 ? 'ml-auto' : ''}`}
            />
          ))}
        </div>
        <div className="divide-y divide-spotify-border/10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="px-6 py-4 grid grid-cols-[40px_1fr_100px_100px_100px_100px] gap-4 items-center animate-pulse"
            >
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12 ml-auto" />
              <Skeleton className="h-4 w-12 ml-auto" />
              <Skeleton className="h-4 w-12 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Artist gallery page skeleton
export function ArtistGallerySkeleton() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg overflow-hidden bg-spotify-card/40 animate-pulse"
          >
            <Skeleton className="w-full h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
