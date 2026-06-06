import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function DiscoverWeeklyBanner() {
  return (
    <Link href="/discover-weekly" className="block group">
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/30 hover:scale-[1.01]">
        {/* Animated background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-400/20 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center shadow-xl shrink-0">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70 font-semibold mb-1">
              Made for you
            </p>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
              Discover Weekly
            </h3>
            <p className="text-sm text-white/70">
              Your weekly mixtape of fresh music. Enjoy new discoveries and deep cuts.
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
