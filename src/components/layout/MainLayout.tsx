import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import PlayerBar from '@/components/player/PlayerBar';
import GuestBanner from '@/components/ui/GuestBanner';
import { useAuthStore } from '@/stores/useAuthStore';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-spotify-black pb-28">
          {children}
        </main>
      </div>

      {/* Guest Banner (above player bar) */}
      {!user && <GuestBanner />}

      {/* Bottom Player Bar */}
      <PlayerBar />
    </div>
  );
}
