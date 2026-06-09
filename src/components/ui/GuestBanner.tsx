import { useState } from 'react';
import Link from 'next/link';
import { X, Music2 } from 'lucide-react';

export default function GuestBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-[90px] left-0 right-0 z-20 bg-gradient-to-r from-[#af2896] to-[#509bf5] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Music2 className="w-6 h-6 text-white shrink-0" />
          <div>
            <p className="text-sm font-bold text-white">
              Preview of Spotify Clone
            </p>
            <p className="text-xs text-white/80">
              Daftar gratis untuk menikmati fitur penuh — play lagu, like, follow, dan buat playlist.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/register"
            className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-transform"
          >
            Daftar Gratis
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 text-white text-sm font-bold hover:underline transition-colors"
          >
            Login
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-white/60 hover:text-white transition-colors ml-2"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
