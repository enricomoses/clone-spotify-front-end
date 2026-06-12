import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import PlayerBar from '@/components/player/PlayerBar';
import BottomNav from './BottomNav';
import GuestBanner from '@/components/ui/GuestBanner';
import ToastContainer from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/useAuthStore';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar (desktop only) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Header */}
        <Header />

        {/* Page Content — pb accounts for player bar (90px) + bottom nav on mobile (56px) */}
        <main className="flex-1 overflow-y-auto bg-spotify-black pb-[146px] lg:pb-[90px]">
          {children}
        </main>
      </div>

      {/* Guest Banner (above player bar) */}
      {!user && <GuestBanner />}

      {/* Bottom Player Bar */}
      <PlayerBar />

      {/* Mobile Bottom Navigation (below lg) */}
      <BottomNav />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
