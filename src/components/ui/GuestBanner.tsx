import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function GuestBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-[80px] lg:bottom-[90px] left-0 right-0 z-20 bg-gradient-to-r from-[#af2896] to-[#509bf5] px-3 sm:px-4 py-2.5 sm:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/general/logo.svg" className="w-6 h-6 shrink-0 hidden sm:block" alt="Logo" />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-white truncate">
              Preview of Spotify Clone
            </p>
            <p className="text-[10px] sm:text-xs text-white/80 hidden sm:block">
              Daftar gratis untuk menikmati fitur penuh — play lagu, like, follow, dan buat playlist.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/register"
            className="px-3 sm:px-5 py-1.5 sm:py-2 bg-white text-black text-xs sm:text-sm font-bold rounded-full hover:scale-105 transition-transform whitespace-nowrap"
          >
            Daftar Gratis
          </Link>
          <Link
            href="/login"
            className="px-3 sm:px-5 py-1.5 sm:py-2 text-white text-xs sm:text-sm font-bold hover:underline transition-colors hidden sm:inline-flex"
          >
            Login
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
