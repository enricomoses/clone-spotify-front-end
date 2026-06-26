import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, User, LogIn, Sidebar } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';

export default function Header() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isCollapsed = useUIStore((s) => s.isSidebarCollapsed);
  const toggleCollapse = useUIStore((s) => s.toggleSidebarCollapsed);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-spotify-black/80 backdrop-blur-md">
      {/* History Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex w-8 h-8 items-center justify-center text-spotify-muted hover:text-white transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Sidebar className="w-5 h-5" />
        </button>
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => window.history.forward()}
          className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          aria-label="Go forward"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Right Side */}
      <div className="relative" ref={menuRef}>
        {user ? (
          <>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 bg-black/60 hover:bg-spotify-card rounded-full p-0.5 pr-3 transition-colors"
              aria-label="User menu"
            >
              <div className="w-7 h-7 rounded-full bg-spotify-card flex items-center justify-center overflow-hidden">
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-spotify-muted" />
                )}
              </div>
              <span className="text-sm font-bold text-white max-w-[120px] truncate">
                {user.name}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-spotify-card rounded-md shadow-xl shadow-black/40 border border-spotify-border py-1 animate-fade-in z-50">
                <button
                  onClick={() => {
                    router.push('/profile');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-spotify-muted hover:text-white hover:bg-spotify-hover transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    router.push('/profile/recents');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-spotify-muted hover:text-white hover:bg-spotify-hover transition-colors"
                >
                  Recents
                </button>
                <hr className="border-spotify-border my-1" />
                <button
                  onClick={() => {
                    logout();
                    router.push('/home');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-spotify-muted hover:text-white hover:bg-spotify-hover transition-colors"
                >
                  Log out
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="text-sm font-bold text-spotify-muted hover:text-white transition-colors"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-transform"
            >
              <LogIn className="w-4 h-4" />
              Log in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
