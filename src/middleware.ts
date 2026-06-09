import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ==========================================
  // ARTIST MIDDLEWARE
  // ==========================================

  // If accessing /artist (without sub-path), redirect based on condition
  if (pathname === '/artist' || pathname === '/artist/') {
    const artistSession = request.cookies.get('artist-session');
    if (artistSession) {
      return NextResponse.redirect(new URL('/artist/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/artist/login', request.url));
    }
  }

  // Protect all /artist/* pages except /artist/login and /artist/[id] (public profile)
  const artistProtectedPaths = [
    '/artist/dashboard',
    '/artist/songs',
    '/artist/albums',
    '/artist/analytics',
    '/artist/gallery',
    '/artist/profile',
    '/artist/concerts',
  ];

  if (artistProtectedPaths.some((p) => pathname.startsWith(p))) {
    const artistSession = request.cookies.get('artist-session');
    if (!artistSession) {
      return NextResponse.redirect(new URL('/artist/login', request.url));
    }
  }

  // If already logged in as artist and accessing /artist/login, redirect to dashboard
  if (pathname === '/artist/login') {
    const artistSession = request.cookies.get('artist-session');
    if (artistSession) {
      return NextResponse.redirect(new URL('/artist/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/artist', '/artist/:path*'],
};
