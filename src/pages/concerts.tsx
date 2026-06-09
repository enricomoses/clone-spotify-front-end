import Head from 'next/head';
import useSWR from 'swr';
import { Calendar, MapPin, ExternalLink, Music } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';
import { PageLoading } from '@/components/ui/Spinner';
import { formatDate } from '@/utils/formatDuration';
import type { Concert } from '@/types';
import Link from 'next/link';

export default function ConcertsPage() {
  const { data: concerts, isLoading } = useSWR<Concert[]>('/concerts', fetcher);

  if (isLoading) return <PageLoading />;

  const allConcerts = concerts || [];
  const now = new Date();

  const upcoming = allConcerts
    .filter((c) => new Date(c.event_at) > now)
    .sort((a, b) => new Date(a.event_at).getTime() - new Date(b.event_at).getTime());

  const past = allConcerts
    .filter((c) => new Date(c.event_at) <= now)
    .sort((a, b) => new Date(b.event_at).getTime() - new Date(a.event_at).getTime());

  return (
    <>
      <Head>
        <title>Concerts — Spotify Clone</title>
        <meta name="description" content="Discover upcoming concerts and live events" />
      </Head>

      <div className="px-6 pb-8">
        <div className="mb-8 pt-4">
          <h1 className="text-3xl font-bold text-white">Concerts & Events</h1>
          <p className="text-sm text-spotify-muted mt-1">
            Discover live music events near you
          </p>
        </div>

        {/* Upcoming Concerts */}
        {upcoming.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-spotify-green" />
              Upcoming Concerts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((concert) => (
                <div
                  key={concert.id_concert}
                  className="bg-spotify-card/50 border border-spotify-border/20 rounded-xl p-5 hover:bg-spotify-card transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-spotify-green/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-spotify-green" />
                    </div>
                    <span className="px-2 py-0.5 bg-spotify-green/20 text-spotify-green text-[10px] font-bold rounded-full uppercase">
                      Upcoming
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-spotify-muted shrink-0" />
                    {concert.location}
                  </h3>
                  <p className="text-sm text-spotify-muted mb-3">
                    {formatDate(concert.event_at)}
                  </p>

                  {/* Artists */}
                  {concert.artists && concert.artists.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {concert.artists.map((artist) => (
                        <Link
                          key={artist.id_artist}
                          href={`/artist/${artist.id_artist}`}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs text-white transition-colors"
                        >
                          {artist.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <a
                    href={concert.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-spotify-green text-black text-sm font-bold rounded-full hover:bg-spotify-green-bright transition-colors"
                  >
                    Buy Tickets
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Past Concerts */}
        {past.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-spotify-muted mb-5">Past Concerts</h2>
            <div className="space-y-3">
              {past.map((concert) => (
                <div
                  key={concert.id_concert}
                  className="flex items-center justify-between bg-spotify-card/30 rounded-lg p-4 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-spotify-muted" />
                    <div>
                      <p className="text-sm font-medium text-white">{concert.location}</p>
                      <p className="text-xs text-spotify-muted">{formatDate(concert.event_at)}</p>
                      {concert.artists && concert.artists.length > 0 && (
                        <p className="text-xs text-spotify-muted mt-0.5">
                          {concert.artists.map((a) => a.name).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-white/5 text-spotify-muted text-[10px] font-bold rounded-full uppercase">
                    Ended
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {allConcerts.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Music className="w-16 h-16 text-spotify-muted/30 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No concerts yet</h2>
            <p className="text-sm text-spotify-muted">
              Check back later for upcoming concerts and events.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
