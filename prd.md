# Product Requirements Document (PRD)
## 🎵 Spotify Clone — Music Streaming Platform

**Versi:** 1.0.0  
**Tanggal:** Juni 2026  
**Status:** Draft  
**Stack:** Next.js (Pages Router) + Laravel 11 (REST API)  

---

## Daftar Isi

1. [Project Overview](#1-project-overview)
2. [Aktor & Peran](#2-aktor--peran)
3. [Technology Stack](#3-technology-stack)
4. [Arsitektur Sistem](#4-arsitektur-sistem)
5. [Migrasi React → Next.js Pages Router](#5-migrasi-react--nextjs-pages-router)
6. [Struktur Halaman & Routing](#6-struktur-halaman--routing)
7. [Fitur Fungsional](#7-fitur-fungsional)
8. [Integrasi API Laravel](#8-integrasi-api-laravel)
9. [State Management](#9-state-management)
10. [Arsitektur Komponen UI](#10-arsitektur-komponen-ui)
11. [Autentikasi & Otorisasi](#11-autentikasi--otorisasi)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Struktur Direktori Proyek](#13-struktur-direktori-proyek)
14. [Panduan Pengembangan](#14-panduan-pengembangan)

---

## 1. Project Overview

### 1.1 Latar Belakang

Proyek ini adalah implementasi frontend dari platform streaming musik yang terinspirasi dari Spotify. Dibangun sebagai bagian dari project Basis Data, frontend dikembangkan menggunakan **Next.js (Pages Router)** yang berkomunikasi dengan backend **Laravel 11** via REST API yang berjalan di `http://127.0.0.1:8000`.

Proyek ini merupakan bentuk penyederhanaan (clone) dari Spotify. Fitur yang dibangun berfokus pada aspek-aspek yang bersinggungan langsung dengan pengalaman pengguna (user-facing features), seperti streaming musik, manajemen playlist, interaksi sosial, serta portal khusus artis.

### 1.2 Tujuan Proyek

- Membangun antarmuka pengguna (UI) yang menyerupai Spotify untuk sisi User dan Artist.
- Mengintegrasikan UI dengan Laravel REST API yang sudah tersedia.
- Mengimplementasikan fitur streaming musik, pencarian, playlist, dan discover weekly.
- Menyediakan portal "Spotify for Artists" bagi artis untuk mengelola karya dan melihat analitik.
- Mengimplementasikan fitur sosial antar pengguna.

### 1.3 Lingkup Proyek

| Fitur | Status |
|---|---|
| Autentikasi User (Login/Register) | ✅ In Scope |
| Autentikasi Artist (Spotify for Artists) | ✅ In Scope |
| Streaming Lagu | ✅ In Scope |
| Pencarian Lagu & Artis | ✅ In Scope |
| Manajemen Playlist (CRUD) | ✅ In Scope |
| Discover Weekly | ✅ In Scope |
| Fitur Sosial (Follow, Like, Share) | ✅ In Scope |
| Portal Artist (CRUD Lagu, Lihat Analitik) | ✅ In Scope |
| Podcast & Episode | ✅ In Scope |
| Sistem Berlangganan / Monetisasi | ❌ Out of Scope |
| Sistem Iklan (Ads) | ❌ Out of Scope |
| Rekomendasi berbasis AI/ML | ❌ Out of Scope |
| Manajemen Royalti & Lisensi | ❌ Out of Scope |

---

## 2. Aktor & Peran

### 2.1 User (Pendengar / Podcaster)

Pengguna umum yang mendaftar melalui halaman registrasi. Dapat:
- Memutar lagu dan podcast.
- Membuat dan mengelola playlist.
- Mengikuti artis, playlist, podcast, dan user lain.
- Menyukai (like) lagu.
- Berkolaborasi dalam playlist.
- Membuat dan mengelola podcast beserta episodenya.
- Melihat aktivitas sosial (lagu yang didengar teman, dsb.).

### 2.2 Artist

Kreator musik yang datanya sudah dimasukkan secara manual ke database oleh admin. Artist mengakses sistem melalui portal khusus **Spotify for Artists** (`/artist/login`). Dapat:
- Login dengan email dan password artist.
- Melihat dan mengelola profil artis.
- Membuat, mengedit, dan menghapus lagu (Song).
- Membuat dan mengelola album.
- Mengelola galeri foto artis.
- Melihat analitik streaming (riwayat pemutaran lagu per lagu).

### 2.3 Sistem (Otomatis)

- Merekam setiap pemutaran lagu ke `StreamingHistory` secara otomatis.
- Menghitung dan menampilkan **Discover Weekly** setiap hari Senin berdasarkan akumulasi stream 7 hari terakhir.

---

## 3. Technology Stack

### 3.1 Frontend

| Teknologi | Versi | Fungsi |
|---|---|---|
| **Next.js** | 14.x (Pages Router) | Framework React SSR/SSG/CSR |
| **React** | 18.x | Library UI |
| **TypeScript** | 5.x | Type Safety |
| **Tailwind CSS** | 3.x | Styling & Responsive Design |
| **Zustand** | 4.x | Global State Management (Player, Auth) |
| **SWR** | 2.x | Data Fetching & Caching dari API |
| **Axios** | 1.x | HTTP Client untuk Laravel API |
| **Howler.js** | 2.x | Audio Playback Engine |
| **React Hook Form** | 7.x | Form Handling & Validation |
| **Zod** | 3.x | Schema Validation |
| **Lucide React** | Latest | Icon Library |
| **clsx / tailwind-merge** | Latest | Utility class merging |

### 3.2 Backend (Existing — Laravel)

| Teknologi | Keterangan |
|---|---|
| **Laravel 11** | Framework PHP untuk REST API |
| **PostgreSQL** | Database utama |
| **Base URL** | `http://127.0.0.1:8000/api` |

### 3.3 Dev Tools

| Tool | Fungsi |
|---|---|
| **ESLint** | Linting |
| **Prettier** | Code Formatting |
| **Husky + lint-staged** | Pre-commit hooks |

---

## 4. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER / CLIENT                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Next.js 14 (Pages Router)                 │  │
│  │                                                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │  │
│  │  │  Pages   │  │Components│  │  State Management  │  │  │
│  │  │ /pages/* │  │/components│ │  Zustand Stores    │  │  │
│  │  └──────────┘  └──────────┘  │  - usePlayerStore  │  │  │
│  │                              │  - useAuthStore    │  │  │
│  │  ┌──────────────────────┐    │  - useArtistStore  │  │  │
│  │  │   API Layer (SWR +   │    └────────────────────┘  │  │
│  │  │   Axios Interceptors)│                             │  │
│  │  └──────────────────────┘                             │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Laravel 11 REST API                             │
│              http://127.0.0.1:8000/api                       │
│                                                              │
│  /songs  /users  /artists  /albums  /playlists               │
│  /podcasts  /episodes  /streaming-history                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Migrasi React → Next.js Pages Router

### 5.1 Perbedaan Utama

| Aspek | React (CRA/Vite) | Next.js Pages Router |
|---|---|---|
| **Routing** | React Router v6 (`<BrowserRouter>`) | File-based routing di `/pages` |
| **Entry Point** | `index.html` + `main.tsx` | `pages/_app.tsx` + `pages/_document.tsx` |
| **Data Fetching** | `useEffect` + fetch | `getServerSideProps`, `getStaticProps`, atau SWR di client |
| **Environment Vars** | `REACT_APP_*` | `NEXT_PUBLIC_*` |
| **Image Optimization** | `<img>` tag biasa | `next/image` (`<Image>`) |
| **Link Component** | `<Link to="...">` | `<Link href="...">` dari `next/link` |
| **Code Splitting** | Manual via `React.lazy` | Otomatis per halaman |
| **Head/Meta** | `react-helmet` | `next/head` (`<Head>`) |
| **API Routes** | Tidak ada | `/pages/api/*` (opsional, tidak dipakai karena sudah ada Laravel) |
| **Static Export** | Tidak native | `next export` |

### 5.2 Langkah Migrasi

#### Step 1 — Inisialisasi Proyek Next.js

```bash
npx create-next-app@latest spotify-clone-next \
  --typescript \
  --tailwind \
  --eslint \
  --app=false  # <-- Penting: gunakan Pages Router, bukan App Router
  --src-dir=false \
  --import-alias="@/*"

cd spotify-clone-next
```

#### Step 2 — Install Dependencies

```bash
npm install zustand swr axios howler react-hook-form zod @hookform/resolvers \
  lucide-react clsx tailwind-merge
npm install @types/howler --save-dev
```

#### Step 3 — Konversi Routing

**React Router (sebelum):**
```tsx
// App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/search" element={<Search />} />
    <Route path="/playlist/:id" element={<PlaylistDetail />} />
  </Routes>
</BrowserRouter>
```

**Next.js Pages Router (sesudah):**
```
pages/
├── index.tsx          → "/"
├── search.tsx         → "/search"
└── playlist/
    └── [id].tsx       → "/playlist/:id"
```

#### Step 4 — Konversi `<Link>` dan `useNavigate`

```tsx
// Sebelum (React Router)
import { Link, useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/search');
<Link to="/search">Search</Link>

// Sesudah (Next.js)
import Link from 'next/link';
import { useRouter } from 'next/router';
const router = useRouter();
router.push('/search');
<Link href="/search">Search</Link>
```

#### Step 5 — Konversi Environment Variables

```bash
# Sebelum (Create React App)
REACT_APP_API_URL=http://127.0.0.1:8000/api

# Sesudah (Next.js) — di .env.local
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

#### Step 6 — Setup `_app.tsx` sebagai pengganti `App.tsx`

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { PlayerBar } from '@/components/player/PlayerBar';
import { Sidebar } from '@/components/layout/Sidebar';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-24">
        <Component {...pageProps} />
      </main>
      <PlayerBar />
    </div>
  );
}
```

#### Step 7 — Konversi Data Fetching

```tsx
// Sebelum (React)
const [songs, setSongs] = useState([]);
useEffect(() => {
  fetch('/api/songs').then(r => r.json()).then(setSongs);
}, []);

// Sesudah (Next.js + SWR)
import useSWR from 'swr';
const { data, error, isLoading } = useSWR('/songs', fetcher);
```

#### Step 8 — `_document.tsx` untuk konfigurasi HTML global

```tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Circular+Std:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>
      <body className="bg-black">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

---

## 6. Struktur Halaman & Routing

### 6.1 User Pages

| Route | File | Deskripsi |
|---|---|---|
| `/` | `pages/index.tsx` | Landing page / redirect ke home jika sudah login |
| `/login` | `pages/login.tsx` | Halaman login user |
| `/register` | `pages/register.tsx` | Halaman registrasi user baru |
| `/home` | `pages/home.tsx` | Dashboard utama setelah login |
| `/search` | `pages/search.tsx` | Pencarian lagu dan artis |
| `/discover-weekly` | `pages/discover-weekly.tsx` | Halaman Discover Weekly |
| `/album/[id]` | `pages/album/[id].tsx` | Detail album beserta daftar lagu |
| `/artist/[id]` | `pages/artist/[id].tsx` | Profil artis (galeri, album, lagu) |
| `/playlist/[id]` | `pages/playlist/[id].tsx` | Detail playlist beserta lagu |
| `/playlist/create` | `pages/playlist/create.tsx` | Form membuat playlist baru |
| `/playlist/[id]/edit` | `pages/playlist/[id]/edit.tsx` | Edit playlist |
| `/podcast` | `pages/podcast/index.tsx` | Daftar semua podcast |
| `/podcast/[id]` | `pages/podcast/[id].tsx` | Detail podcast + daftar episode |
| `/podcast/create` | `pages/podcast/create.tsx` | Buat podcast baru (sebagai creator) |
| `/podcast/[id]/episode/create` | `pages/podcast/[id]/episode/create.tsx` | Upload episode baru |
| `/profile` | `pages/profile/index.tsx` | Profil user yang sedang login |
| `/profile/[id]` | `pages/profile/[id].tsx` | Profil user lain (sosial) |

### 6.2 Artist Pages (Spotify for Artists)

| Route | File | Deskripsi |
|---|---|---|
| `/artist/login` | `pages/artist/login.tsx` | Login portal khusus artis |
| `/artist/dashboard` | `pages/artist/dashboard.tsx` | Dashboard artis (overview analitik) |
| `/artist/songs` | `pages/artist/songs/index.tsx` | Daftar lagu milik artis + aksi hapus |
| `/artist/songs/create` | `pages/artist/songs/create.tsx` | Form tambah lagu baru |
| `/artist/songs/[id]/edit` | `pages/artist/songs/[id]/edit.tsx` | Form edit lagu |
| `/artist/albums` | `pages/artist/albums/index.tsx` | Daftar album milik artis |
| `/artist/albums/create` | `pages/artist/albums/create.tsx` | Form buat album baru |
| `/artist/albums/[id]/edit` | `pages/artist/albums/[id]/edit.tsx` | Form edit album |
| `/artist/analytics` | `pages/artist/analytics/index.tsx` | Analitik streaming per lagu |
| `/artist/gallery` | `pages/artist/gallery/index.tsx` | Kelola galeri foto artis |
| `/artist/profile/edit` | `pages/artist/profile/edit.tsx` | Edit profil artis |

### 6.3 Halaman Error & Utilitas

| Route | File | Deskripsi |
|---|---|---|
| `/404` | `pages/404.tsx` | Halaman Not Found |
| `/500` | `pages/500.tsx` | Halaman Server Error |

---

## 7. Fitur Fungsional

### 7.1 Autentikasi User

**F-AUTH-01: Login User**
- Halaman: `/login`
- User memasukkan email dan password.
- Frontend mencocokkan ke endpoint `GET /api/users` dan memfilter berdasarkan email + password (karena tidak ada endpoint login khusus di Laravel yang tersedia).
- Jika berhasil, data user disimpan di Zustand store dan `localStorage`.
- Redirect ke `/home` setelah login berhasil.
- Jika gagal, tampilkan pesan error.

> **Catatan Implementasi:** Karena backend belum mengimplementasikan endpoint `/login` dengan session/token, autentikasi dilakukan secara client-side dengan menyimpan data user ke Zustand + localStorage. Untuk keamanan, pertimbangkan menambahkan endpoint `POST /api/auth/login` di Laravel di iterasi berikutnya.

**F-AUTH-02: Register User**
- Halaman: `/register`
- Form: name, email, password, birthday (opsional), gender (opsional), country (opsional).
- Memanggil `POST /api/users`.
- Validasi client-side menggunakan Zod:
  - Email harus valid dan unik (cek via API).
  - Password minimal 6 karakter.
  - Birthday harus sebelum hari ini jika diisi.
- Setelah berhasil, redirect ke `/login`.

**F-AUTH-03: Logout User**
- Tombol logout di sidebar/profile menu.
- Hapus data user dari Zustand store dan `localStorage`.
- Redirect ke `/login`.

**F-AUTH-04: Proteksi Route**
- Semua halaman `/home`, `/search`, `/playlist/*`, `/profile/*`, `/podcast/*` harus diproteksi.
- Gunakan HOC `withAuth` atau middleware di `pages/_middleware.ts`.
- Jika belum login, redirect ke `/login`.

```tsx
// utils/withAuth.tsx — Higher Order Component untuk proteksi route
export function withAuth(Component: React.ComponentType) {
  return function ProtectedPage(props: any) {
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
      if (!user) router.replace('/login');
    }, [user]);

    if (!user) return null;
    return <Component {...props} />;
  };
}
```

---

### 7.2 Autentikasi Artist (Spotify for Artists)

**F-ARTIST-AUTH-01: Login Artist**
- Halaman khusus: `/artist/login` — terpisah dari login user.
- UI mirip dengan Spotify for Artists (warna hijau, brand berbeda).
- Artist memasukkan email dan password.
- Frontend mencocokkan ke `GET /api/artists` dan memfilter berdasarkan email + password.
- Jika berhasil, data artist disimpan di Zustand `useArtistStore` + `localStorage` (key berbeda dari user auth).
- Redirect ke `/artist/dashboard`.

**F-ARTIST-AUTH-02: Logout Artist**
- Hapus data artist dari store dan localStorage.
- Redirect ke `/artist/login`.

**F-ARTIST-AUTH-03: Proteksi Route Artist**
- Semua halaman `/artist/*` kecuali `/artist/login` harus diproteksi.
- Gunakan HOC `withArtistAuth`.
- Jika belum login sebagai artist, redirect ke `/artist/login`.

---

### 7.3 Streaming Musik

**F-STREAM-01: Memutar Lagu**
- User klik tombol play pada lagu manapun (di halaman album, playlist, search, discover weekly).
- Audio engine menggunakan **Howler.js**.
- URL audio diambil dari data song (perlu `audio_url` di model Song — lihat catatan di bawah).
- PlayerBar muncul di bagian bawah halaman (persistent, tidak ter-reset saat navigasi antar halaman).

> **Catatan:** Skema database Song tidak memiliki kolom `audio_url`. Untuk keperluan demo, audio bisa menggunakan URL sample publik atau ditambahkan field `audio_url` di tabel Song. Alternatifnya, sematkan URL audio sebagai field tambahan atau gunakan placeholder audio.

**F-STREAM-02: Kontrol Player**
- Play / Pause
- Skip Next / Previous (berdasarkan urutan queue)
- Seek (progress bar)
- Volume control
- Shuffle mode
- Repeat mode (off / repeat-one / repeat-all)
- Tampilkan judul lagu, nama artis, cover album yang sedang diputar.

**F-STREAM-03: Queue / Antrian Lagu**
- Saat user memutar lagu dari konteks tertentu (album, playlist), seluruh lagu dalam konteks tersebut masuk ke queue secara otomatis.
- User bisa melihat queue saat ini.

**F-STREAM-04: Pencatatan Streaming History (Otomatis)**
- Setiap kali lagu diputar dan `play_duration > 0`, sistem secara otomatis memanggil `POST /api/streaming-history` setelah lagu selesai atau user skip (minimal sekian detik).
- Payload: `{ id_stream, played_at, play_duration, id_user, id_song }`.
- `id_stream` dibuat di frontend (UUID atau format custom).
- `played_at` diisi dengan timestamp saat lagu mulai diputar.

---

### 7.4 Pencarian

**F-SEARCH-01: Pencarian Lagu & Artis**
- Halaman: `/search`
- Input search bar, pencarian dilakukan saat user mengetik (debounce 300ms).
- Frontend memfilter hasil dari data yang sudah di-fetch (client-side search) karena backend tidak menyediakan endpoint pencarian khusus.
- Data yang dicari:
  - Lagu: `GET /api/songs` → filter berdasarkan `title`.
  - Artis: `GET /api/artists` → filter berdasarkan `name`.
- Hasil ditampilkan dalam dua seksi terpisah: **Lagu** dan **Artis**.
- Tiap hasil lagu memiliki tombol play langsung.
- Tiap hasil artis bisa diklik untuk menuju halaman `/artist/[id]`.

> **Rekomendasi Backend:** Tambahkan query parameter `?search=` di Laravel controller untuk mendukung server-side search agar lebih efisien dengan data besar.

---

### 7.5 Discover Weekly

**F-DW-01: Tampilan Discover Weekly**
- Halaman: `/discover-weekly`
- Juga ditampilkan sebagai section di `/home`.
- Menampilkan 50 lagu terpopuler berdasarkan total stream dalam 7 hari terakhir.

**F-DW-02: Kalkulasi Discover Weekly (Client-Side)**

Karena backend tidak menyediakan endpoint khusus, kalkulasi dilakukan di frontend:

```typescript
// utils/discoverWeekly.ts
async function getDiscoverWeekly() {
  // 1. Fetch semua streaming history
  const history = await fetcher('/streaming-history');

  // 2. Filter 7 hari terakhir
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent = history.data.filter(
    (h: StreamingHistory) => new Date(h.played_at) >= sevenDaysAgo
  );

  // 3. Hitung total stream per lagu
  const songStreamCount: Record<string, number> = {};
  recent.forEach((h: StreamingHistory) => {
    songStreamCount[h.id_song] = (songStreamCount[h.id_song] || 0) + 1;
  });

  // 4. Sort descending dan ambil top 50
  const top50 = Object.entries(songStreamCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 50)
    .map(([id_song]) => id_song);

  // 5. Fetch detail lagu
  const songs = await fetcher('/songs');
  return songs.data.filter((s: Song) => top50.includes(s.id_song))
    .sort((a: Song, b: Song) =>
      top50.indexOf(a.id_song) - top50.indexOf(b.id_song)
    );
}
```

**F-DW-03: Jadwal Update**
- Discover Weekly ditampilkan sebagai "Week of [tanggal Senin]".
- Data di-cache menggunakan SWR dengan `revalidateOnFocus: false` dan TTL panjang.
- Karena kalkulasi manual, refresh data dilakukan setiap kali halaman dimuat pada hari Senin.

---

### 7.6 Manajemen Playlist

**F-PL-01: Membuat Playlist**
- Halaman: `/playlist/create`
- Form: nama (wajib), deskripsi (opsional), cover image URL (opsional), kategori (pilih dari `PlaylistCategory`).
- Panggil `POST /api/playlists` (perlu endpoint ini di backend — saat ini PlaylistController hanya punya `index` dan `show`).
- Setelah berhasil, redirect ke `/playlist/[id]`.

**F-PL-02: Melihat Detail Playlist**
- Halaman: `/playlist/[id]`
- Tampilkan nama, deskripsi, cover, kategori, daftar lagu, dan kolaborator.
- Menggunakan `GET /api/playlists/:id` yang mengembalikan data songs, collaborators, dan category.

**F-PL-03: Menambah Lagu ke Playlist**
- Tombol "Tambah ke Playlist" muncul di setiap lagu (via konteks menu / tombol pada baris lagu).
- Modal muncul untuk memilih playlist mana yang dituju.
- Memanggil endpoint untuk menambah lagu ke playlist (perlu route tambahan di backend: `POST /api/playlists/{id}/songs`).

**F-PL-04: Menghapus Lagu dari Playlist**
- Hanya bisa dilakukan oleh owner atau collaborator dengan role `editor`.
- Memanggil endpoint `DELETE /api/playlists/{id}/songs/{song_id}`.

**F-PL-05: Kolaborasi Playlist**
- Owner bisa mengundang user lain sebagai kolaborator via input email.
- Role tersedia: `editor` (bisa tambah/hapus lagu), `viewer` (hanya melihat).
- Memanggil endpoint untuk menambah collaborator (perlu route: `POST /api/playlists/{id}/collaborators`).

**F-PL-06: Follow Playlist**
- User bisa follow playlist milik user lain.
- Tombol "Follow" di halaman detail playlist.
- Playlist yang di-follow muncul di sidebar dan halaman profil user.

---

### 7.7 Fitur Sosial

**F-SOCIAL-01: Follow Artist**
- Tombol "Follow" / "Unfollow" di halaman `/artist/[id]`.
- Artis yang di-follow muncul di sidebar dan halaman profil user.
- Memanggil endpoint relasi `User_FollowArtist` (perlu route: `POST /api/users/{id}/follow-artist`).

**F-SOCIAL-02: Follow User Lain**
- Tombol "Follow" di halaman profil user lain `/profile/[id]`.
- Fitur sosial: user bisa melihat "apa yang didengar teman" di halaman profil teman.
- Memanggil endpoint relasi `User_FollowUser`.

**F-SOCIAL-03: Follow Podcast**
- Tombol "Follow" / "Unfollow" di halaman `/podcast/[id]`.

**F-SOCIAL-04: Like Lagu**
- Tombol ❤️ di setiap baris lagu (di player bar, daftar lagu, dll).
- User hanya bisa like satu kali per lagu.
- Lagu yang di-like muncul di halaman profil dan "Liked Songs" di sidebar.
- Memanggil endpoint `User_LikedSong`.

**F-SOCIAL-05: Melihat Aktivitas Teman**
- Di halaman `/profile/[id]` user lain, tampilkan:
  - Lagu yang baru-baru ini diputar (dari `streaming-history`).
  - Playlist yang mereka miliki.
  - Artis yang mereka follow.

**F-SOCIAL-06: Share Playlist**
- Tombol "Share" di halaman detail playlist.
- Menyalin URL `/playlist/[id]` ke clipboard.
- Tampilkan toast notification: "Link berhasil disalin!"

---

### 7.8 Portal Artis — Spotify for Artists

**F-ARTIST-01: Dashboard Artis**
- Halaman: `/artist/dashboard`
- Overview statistik:
  - Total lagu
  - Total album
  - Total stream (semua waktu)
  - Total stream minggu ini
  - Lagu paling banyak diputar (top 5)
- Grafik sederhana stream per hari dalam 7 hari terakhir.

**F-ARTIST-02: Manajemen Lagu**
- Halaman: `/artist/songs`
- Daftar semua lagu milik artis (filter dari `GET /api/songs` berdasarkan artis yang login).
- Aksi per lagu: Edit, Hapus.
- Tombol "Tambah Lagu Baru" menuju `/artist/songs/create`.

**F-ARTIST-03: Tambah Lagu**
- Halaman: `/artist/songs/create`
- Form: judul (wajib), durasi dalam detik (wajib), pilih album (dropdown dari album milik artis), audio URL.
- Memanggil `POST /api/songs`.
- Validasi: judul tidak boleh kosong, durasi harus > 0.

**F-ARTIST-04: Edit Lagu**
- Halaman: `/artist/songs/[id]/edit`
- Pre-fill form dengan data lagu yang ada.
- Memanggil `PUT /api/songs/:id`.

**F-ARTIST-05: Hapus Lagu**
- Konfirmasi dialog sebelum hapus.
- Memanggil `DELETE /api/songs/:id`.
- Setelah berhasil, redirect kembali ke daftar lagu.

**F-ARTIST-06: Manajemen Album**
- Halaman: `/artist/albums`
- CRUD album (create, edit, delete).
- Create album memanggil `POST /api/albums`.

**F-ARTIST-07: Analitik Streaming**
- Halaman: `/artist/analytics`
- Menampilkan riwayat streaming per lagu milik artis.
- Data dari `GET /api/streaming-history` → filter berdasarkan `id_song` milik artis yang login.
- Tampilkan tabel: nama lagu, total stream, stream minggu ini, stream hari ini.
- Grafik bar chart stream per lagu (top 10).

**F-ARTIST-08: Galeri Foto**
- Halaman: `/artist/gallery`
- Tampilkan semua foto galeri artis.
- Tambah foto baru (URL input + deskripsi opsional).
- Hapus foto dari galeri.
- Endpoint: `Artist_Gallery` (perlu ditambahkan di backend).

---

### 7.9 Podcast & Episode

**F-POD-01: Daftar Podcast**
- Halaman: `/podcast`
- Menggunakan `GET /api/podcasts` (include category dan creator).
- Filter berdasarkan kategori.

**F-POD-02: Detail Podcast**
- Halaman: `/podcast/[id]`
- Menggunakan `GET /api/podcasts/:id` (include episodes, category, creator).
- Tampilkan daftar episode, tombol Follow.

**F-POD-03: Buat Podcast**
- Halaman: `/podcast/create` (hanya untuk user yang login).
- Form: nama, tentang, cover image URL, pilih kategori.
- Memanggil `POST /api/podcasts`.

**F-POD-04: Upload Episode**
- Halaman: `/podcast/[id]/episode/create`
- Form: judul, deskripsi, tanggal publish, durasi, audio URL, video URL (opsional), thumbnail.
- Memanggil `POST /api/episodes`.

---

## 8. Integrasi API Laravel

### 8.1 Konfigurasi Axios

```typescript
// lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor (jika nanti ada token auth)
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect ke login jika unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 8.2 SWR Fetcher

```typescript
// lib/fetcher.ts
import api from './axios';

export const fetcher = (url: string) =>
  api.get(url).then((res) => res.data.data);
```

### 8.3 Tabel Endpoint yang Tersedia

| Method | Endpoint | Deskripsi | Response |
|---|---|---|---|
| GET | `/api/songs` | Semua lagu + relasi album | `{ data: Song[] }` |
| POST | `/api/songs` | Tambah lagu baru | `{ data: Song }` |
| GET | `/api/songs/:id` | Detail lagu | `{ data: Song }` |
| PUT | `/api/songs/:id` | Update lagu | `{ data: Song }` |
| DELETE | `/api/songs/:id` | Hapus lagu | `{ message: string }` |
| GET | `/api/streaming-history` | Semua riwayat streaming | `{ data: StreamHistory[] }` |
| POST | `/api/streaming-history` | Catat streaming baru | `{ data: StreamHistory }` |
| GET | `/api/users` | Semua user | `{ data: User[] }` |
| POST | `/api/users` | Registrasi user | `{ data: User }` |
| GET | `/api/users/:id` | Detail user + followedPlaylists + following | `{ data: User }` |
| PUT | `/api/users/:id` | Update profil user | `{ data: User }` |
| DELETE | `/api/users/:id` | Hapus user | `{ message: string }` |
| GET | `/api/artists` | Semua artis | `{ data: Artist[] }` |
| GET | `/api/artists/:id` | Detail artis + albums + songs | `{ data: Artist }` |
| GET | `/api/albums` | Semua album + artists + songs | `{ data: Album[] }` |
| POST | `/api/albums` | Buat album baru | `{ data: Album }` |
| GET | `/api/albums/:id` | Detail album | `{ data: Album }` |
| PUT | `/api/albums/:id` | Update album | `{ data: Album }` |
| DELETE | `/api/albums/:id` | Hapus album | `{ message: string }` |
| GET | `/api/playlists` | Semua playlist + category | `{ data: Playlist[] }` |
| GET | `/api/playlists/:id` | Detail playlist + songs + collaborators | `{ data: Playlist }` |
| GET | `/api/podcasts` | Semua podcast + category + creator | `{ data: Podcast[] }` |
| POST | `/api/podcasts` | Buat podcast baru | `{ data: Podcast }` |
| GET | `/api/podcasts/:id` | Detail podcast + episodes | `{ data: Podcast }` |
| PUT | `/api/podcasts/:id` | Update podcast | `{ data: Podcast }` |
| DELETE | `/api/podcasts/:id` | Hapus podcast | `{ message: string }` |
| GET | `/api/episodes` | Semua episode + podcast | `{ data: Episode[] }` |
| POST | `/api/episodes` | Upload episode baru | `{ data: Episode }` |
| GET | `/api/episodes/:id` | Detail episode | `{ data: Episode }` |
| PUT | `/api/episodes/:id` | Update episode | `{ data: Episode }` |
| DELETE | `/api/episodes/:id` | Hapus episode | `{ message: string }` |

### 8.4 Endpoint yang Perlu Ditambahkan di Backend Laravel

Berikut adalah endpoint yang dibutuhkan frontend tetapi belum tersedia di backend:

| Method | Endpoint | Kebutuhan |
|---|---|---|
| POST | `/api/playlists` | Buat playlist baru |
| PUT | `/api/playlists/:id` | Update playlist |
| DELETE | `/api/playlists/:id` | Hapus playlist |
| POST | `/api/playlists/:id/songs` | Tambah lagu ke playlist |
| DELETE | `/api/playlists/:id/songs/:song_id` | Hapus lagu dari playlist |
| POST | `/api/playlists/:id/collaborators` | Tambah kolaborator |
| DELETE | `/api/playlists/:id/collaborators/:user_id` | Hapus kolaborator |
| POST | `/api/users/:id/follow-artist` | Follow artis |
| DELETE | `/api/users/:id/unfollow-artist/:artist_id` | Unfollow artis |
| POST | `/api/users/:id/follow-user` | Follow user lain |
| DELETE | `/api/users/:id/unfollow-user/:target_id` | Unfollow user lain |
| POST | `/api/users/:id/follow-playlist` | Follow playlist |
| POST | `/api/users/:id/follow-podcast` | Follow podcast |
| POST | `/api/users/:id/like-song` | Like lagu |
| DELETE | `/api/users/:id/unlike-song/:song_id` | Unlike lagu |
| GET | `/api/artists/:id/gallery` | Galeri artis |
| POST | `/api/artists/:id/gallery` | Tambah foto galeri |
| DELETE | `/api/artists/:id/gallery/:gallery_id` | Hapus foto galeri |
| GET | `/api/playlist-categories` | Daftar kategori playlist |
| GET | `/api/podcast-categories` | Daftar kategori podcast |
| GET | `/api/artists/:id/concerts` | Konser artis |

### 8.5 TypeScript Type Definitions

```typescript
// types/index.ts

export interface User {
  id_user: string;
  name: string;
  email: string;
  birthday?: string;
  gender?: string;
  country?: string;
  profile_picture?: string;
  followedPlaylists?: Playlist[];
  following?: User[];
}

export interface Artist {
  id_artist: string;
  name: string;
  email: string;
  instagram?: string;
  facebook?: string;
  wikipedia?: string;
  x?: string;
  bio?: string;
  profile_picture?: string;
  albums?: Album[];
  songs?: Song[];
}

export interface Album {
  id_album: string;
  title: string;
  release: string;
  cover_image: string;
  artists?: Artist[];
  songs?: Song[];
}

export interface Song {
  id_song: string;
  title: string;
  duration: number; // dalam detik
  id_album?: string;
  album?: Album;
  audio_url?: string; // field tambahan untuk streaming
}

export interface Playlist {
  id_playlist: string;
  name: string;
  description?: string;
  cover_image?: string;
  id_playlist_category?: string;
  category?: PlaylistCategory;
  songs?: Song[];
  collaborators?: PlaylistCollaborator[];
}

export interface PlaylistCollaborator {
  id_playlist: string;
  id_user: string;
  role: 'editor' | 'viewer';
  user?: User;
}

export interface PlaylistCategory {
  id_playlist_category: string;
  name: string;
  cover_image: string;
  icon: string;
}

export interface Podcast {
  id_podcast: string;
  name: string;
  about?: string;
  cover_image?: string;
  id_podcast_category?: string;
  id_user: string;
  category?: PodcastCategory;
  creator?: User;
  episodes?: Episode[];
}

export interface PodcastCategory {
  id_podcast_category: string;
  name: string;
  cover_image: string;
  icon: string;
}

export interface Episode {
  id_episode: string;
  title: string;
  description?: string;
  published_at: string;
  duration: number;
  audio_url: string;
  video_url?: string;
  thumbnail_image?: string;
  id_podcast: string;
  podcast?: Podcast;
}

export interface StreamingHistory {
  id_stream: string;
  played_at: string;
  play_duration?: number;
  id_user: string;
  id_song: string;
  user?: User;
  song?: Song;
}

export interface Concert {
  id_concert: string;
  location: string;
  location_url?: string;
  event_at: string;
  ticket_url: string;
}

export interface ArtistGallery {
  id_gallery: string;
  image_url: string;
  description_pict?: string;
  uploaded_at: string;
  id_artist: string;
}
```

---

## 9. State Management

### 9.1 Zustand Stores

#### Auth Store (User)

```typescript
// stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
      isAuthenticated: () => !!get().user,
    }),
    { name: 'auth-storage' }
  )
);
```

#### Artist Auth Store

```typescript
// stores/useArtistStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ArtistStore {
  artist: Artist | null;
  setArtist: (artist: Artist | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useArtistStore = create<ArtistStore>()(
  persist(
    (set, get) => ({
      artist: null,
      setArtist: (artist) => set({ artist }),
      logout: () => set({ artist: null }),
      isAuthenticated: () => !!get().artist,
    }),
    { name: 'artist-storage' }
  )
);
```

#### Player Store

```typescript
// stores/usePlayerStore.ts
import { create } from 'zustand';

interface PlayerStore {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'one' | 'all';

  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  queue: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isShuffle: false,
  repeatMode: 'off',

  playSong: (song, queue = []) =>
    set({ currentSong: song, queue, isPlaying: true, currentTime: 0 }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  nextSong: () => {
    const { queue, currentSong, isShuffle } = get();
    const idx = queue.findIndex((s) => s.id_song === currentSong?.id_song);
    const nextIdx = isShuffle
      ? Math.floor(Math.random() * queue.length)
      : (idx + 1) % queue.length;
    set({ currentSong: queue[nextIdx], currentTime: 0, isPlaying: true });
  },

  prevSong: () => {
    const { queue, currentSong } = get();
    const idx = queue.findIndex((s) => s.id_song === currentSong?.id_song);
    const prevIdx = (idx - 1 + queue.length) % queue.length;
    set({ currentSong: queue[prevIdx], currentTime: 0, isPlaying: true });
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setVolume: (volume) => set({ volume }),
  toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),
  cycleRepeat: () =>
    set((s) => ({
      repeatMode:
        s.repeatMode === 'off' ? 'one' : s.repeatMode === 'one' ? 'all' : 'off',
    })),
}));
```

---

## 10. Arsitektur Komponen UI

### 10.1 Layout Components

```
components/
├── layout/
│   ├── MainLayout.tsx          # Layout utama (sidebar + main + player)
│   ├── ArtistLayout.tsx        # Layout khusus artist portal
│   ├── Sidebar.tsx             # Sidebar navigasi user
│   ├── ArtistSidebar.tsx       # Sidebar navigasi artist
│   ├── Header.tsx              # Header dengan search bar & profile
│   └── ArtistHeader.tsx        # Header artist portal
│
├── player/
│   ├── PlayerBar.tsx           # Bottom player bar (persistent)
│   ├── PlayerControls.tsx      # Tombol play/pause/skip/shuffle/repeat
│   ├── ProgressBar.tsx         # Seek bar dengan waktu
│   ├── VolumeControl.tsx       # Slider volume
│   ├── NowPlaying.tsx          # Info lagu yang sedang diputar
│   └── QueuePanel.tsx          # Panel antrian lagu
│
├── song/
│   ├── SongRow.tsx             # Satu baris lagu (dalam list)
│   ├── SongCard.tsx            # Kartu lagu (dalam grid)
│   ├── SongList.tsx            # Daftar lagu (render SongRow)
│   └── LikeButton.tsx          # Tombol like/unlike lagu
│
├── album/
│   ├── AlbumCard.tsx           # Kartu album (cover + judul + artis)
│   └── AlbumGrid.tsx           # Grid album
│
├── artist/
│   ├── ArtistCard.tsx          # Kartu artis (foto + nama)
│   └── ArtistHeader.tsx        # Header profil artis
│
├── playlist/
│   ├── PlaylistCard.tsx        # Kartu playlist
│   ├── PlaylistGrid.tsx        # Grid playlist
│   └── CollaboratorBadge.tsx   # Badge kolaborator
│
├── podcast/
│   ├── PodcastCard.tsx         # Kartu podcast
│   └── EpisodeRow.tsx          # Baris episode
│
├── discover/
│   └── DiscoverWeeklyBanner.tsx # Banner Discover Weekly di home
│
├── social/
│   ├── FollowButton.tsx        # Tombol follow/unfollow generik
│   ├── FriendActivity.tsx      # Aktivitas teman (apa yang diputar)
│   └── ShareButton.tsx         # Tombol share + copy link
│
├── search/
│   ├── SearchBar.tsx           # Input pencarian dengan debounce
│   ├── SearchResults.tsx       # Render hasil pencarian
│   └── SearchResultSong.tsx    # Item lagu dalam hasil search
│
├── auth/
│   ├── LoginForm.tsx           # Form login user
│   ├── RegisterForm.tsx        # Form registrasi user
│   └── ArtistLoginForm.tsx     # Form login artist
│
├── artist-portal/              # Komponen khusus portal artis
│   ├── AnalyticsChart.tsx      # Grafik bar chart stream
│   ├── StreamingTable.tsx      # Tabel riwayat streaming
│   ├── SongManageRow.tsx       # Baris lagu di halaman manage songs
│   └── GalleryGrid.tsx         # Grid foto galeri artis
│
└── ui/                         # Reusable primitive components
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    ├── Toast.tsx
    ├── Spinner.tsx
    ├── Badge.tsx
    ├── Card.tsx
    ├── Avatar.tsx
    ├── Dropdown.tsx
    └── ConfirmDialog.tsx
```

### 10.2 Sidebar Navigation (User)

Sidebar berisi:
- **Logo** Spotify Clone
- **Home** → `/home`
- **Search** → `/search`
- **Your Library** (playlist yang dimiliki + di-follow)
- **Discover Weekly** → `/discover-weekly`
- **Create Playlist** → `/playlist/create`
- **Liked Songs** (playlist virtual dari lagu yang di-like)
- Daftar **Followed Playlists**
- Daftar **Followed Podcasts**
- **Profile** → `/profile`
- **Logout**

### 10.3 Bottom Player Bar

Selalu tampil di bagian bawah saat ada lagu aktif, berisi:
- Kiri: cover album kecil, judul lagu, nama artis, tombol ❤️.
- Tengah: kontrol (shuffle, prev, play/pause, next, repeat), progress bar + waktu.
- Kanan: volume slider, tombol antrian.

---

## 11. Autentikasi & Otorisasi

### 11.1 Strategi Autentikasi (Client-Side)

Karena backend Laravel tidak menyediakan endpoint dedicated `/login` atau session token, autentikasi dilakukan dengan cara:

1. Saat login, frontend memanggil `GET /api/users` (atau `GET /api/artists`).
2. Filter hasil berdasarkan `email` yang cocok.
3. Bandingkan `password` yang diinput (karena password di DB bisa berupa plaintext untuk tujuan demo — **jangan digunakan di produksi**).
4. Jika cocok, simpan data user ke Zustand store dan `localStorage`.

> **Rekomendasi untuk Produksi:**  
> Tambahkan endpoint `POST /api/auth/login` di Laravel yang meng-hash password dengan `bcrypt` dan mengembalikan token (misalnya menggunakan Laravel Sanctum).

### 11.2 Middleware Route (Next.js)

```typescript
// middleware.ts (di root proyek)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedUserRoutes = ['/home', '/search', '/playlist', '/profile', '/podcast', '/discover-weekly'];
const protectedArtistRoutes = ['/artist/dashboard', '/artist/songs', '/artist/albums', '/artist/analytics', '/artist/gallery', '/artist/profile'];
const publicRoutes = ['/login', '/register', '/artist/login', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAuth = request.cookies.get('user-auth');
  const artistAuth = request.cookies.get('artist-auth');

  const isUserProtected = protectedUserRoutes.some(r => pathname.startsWith(r));
  const isArtistProtected = protectedArtistRoutes.some(r => pathname.startsWith(r));

  if (isUserProtected && !userAuth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isArtistProtected && !artistAuth) {
    return NextResponse.redirect(new URL('/artist/login', request.url));
  }

  return NextResponse.next();
}
```

---

## 12. Non-Functional Requirements

### 12.1 Performa

| Metrik | Target |
|---|---|
| First Contentful Paint (FCP) | < 1.5 detik |
| Time to Interactive (TTI) | < 3 detik |
| Ukuran bundle JS awal | < 300 KB (gzipped) |
| Response API | < 500ms (local Laravel) |

### 12.2 Responsivitas

- Mendukung tiga breakpoint utama: Mobile (< 640px), Tablet (640px–1024px), Desktop (> 1024px).
- Sidebar collapse otomatis di mobile, menjadi bottom navigation.
- Player bar menyesuaikan tampilan di mobile (tampilan lebih ringkas).

### 12.3 Aksesibilitas

- Semua tombol interaktif memiliki label `aria-label`.
- Navigasi via keyboard (Tab, Enter, Escape).
- Kontras warna memenuhi standar WCAG AA.

### 12.4 Keamanan (Dasar)

- Tidak menyimpan password user dalam bentuk apapun di localStorage.
- Sanitasi input di semua form sebelum dikirim ke API.
- Validasi tipe file dan URL di form galeri artis.

### 12.5 Kompatibilitas Browser

- Chrome 90+, Firefox 90+, Safari 14+, Edge 90+.

---

## 13. Struktur Direktori Proyek

```
spotify-clone-next/
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx                    # Landing / redirect
│   ├── login.tsx
│   ├── register.tsx
│   ├── home.tsx
│   ├── search.tsx
│   ├── discover-weekly.tsx
│   ├── 404.tsx
│   ├── 500.tsx
│   ├── album/
│   │   └── [id].tsx
│   ├── artist/
│   │   ├── [id].tsx                 # Profil artis (view user)
│   │   ├── login.tsx                # Login portal artis
│   │   ├── dashboard.tsx
│   │   ├── profile/
│   │   │   └── edit.tsx
│   │   ├── songs/
│   │   │   ├── index.tsx
│   │   │   ├── create.tsx
│   │   │   └── [id]/
│   │   │       └── edit.tsx
│   │   ├── albums/
│   │   │   ├── index.tsx
│   │   │   ├── create.tsx
│   │   │   └── [id]/
│   │   │       └── edit.tsx
│   │   ├── analytics/
│   │   │   └── index.tsx
│   │   └── gallery/
│   │       └── index.tsx
│   ├── playlist/
│   │   ├── [id].tsx
│   │   ├── create.tsx
│   │   └── [id]/
│   │       └── edit.tsx
│   ├── podcast/
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   └── [id]/
│   │       ├── index.tsx
│   │       └── episode/
│   │           └── create.tsx
│   └── profile/
│       ├── index.tsx                # Profil sendiri
│       └── [id].tsx                 # Profil user lain
│
├── components/
│   ├── layout/
│   ├── player/
│   ├── song/
│   ├── album/
│   ├── artist/
│   ├── playlist/
│   ├── podcast/
│   ├── discover/
│   ├── social/
│   ├── search/
│   ├── auth/
│   ├── artist-portal/
│   └── ui/
│
├── stores/
│   ├── useAuthStore.ts
│   ├── useArtistStore.ts
│   └── usePlayerStore.ts
│
├── lib/
│   ├── axios.ts                     # Axios instance
│   └── fetcher.ts                   # SWR fetcher
│
├── hooks/
│   ├── useSongs.ts                  # SWR hook untuk songs
│   ├── useArtists.ts
│   ├── useAlbums.ts
│   ├── usePlaylists.ts
│   ├── usePodcasts.ts
│   ├── useStreamingHistory.ts
│   ├── usePlayer.ts                 # Howler.js integration hook
│   └── useDiscoverWeekly.ts         # Kalkulasi discover weekly
│
├── types/
│   └── index.ts                     # Semua TypeScript interfaces
│
├── utils/
│   ├── discoverWeekly.ts            # Kalkulasi top 50 mingguan
│   ├── formatDuration.ts            # Format detik → mm:ss
│   ├── generateId.ts                # UUID generator untuk id_stream, dll
│   └── withAuth.tsx                 # HOC proteksi route
│
├── styles/
│   └── globals.css                  # Tailwind base + custom CSS
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── placeholder-cover.png        # Cover default
│
├── .env.local                       # NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 14. Panduan Pengembangan

### 14.1 Setup Awal

```bash
# 1. Clone / inisialisasi proyek
npx create-next-app@latest spotify-clone-next \
  --typescript --tailwind --eslint

# 2. Masuk ke direktori proyek
cd spotify-clone-next

# 3. Install dependencies
npm install zustand swr axios howler react-hook-form zod \
  @hookform/resolvers lucide-react clsx tailwind-merge uuid
npm install @types/howler @types/uuid --save-dev

# 4. Buat file .env.local
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api" > .env.local

# 5. Jalankan development server
npm run dev
# Frontend: http://localhost:3000

# Pastikan Laravel berjalan di port 8000
# php artisan serve  (di direktori Laravel)
```

### 14.2 Urutan Pengembangan (Development Order)

Disarankan dikerjakan secara berurutan:

**Phase 1 — Foundation**
1. Setup Next.js + Tailwind + Zustand + Axios/SWR.
2. Implementasi `_app.tsx` (MainLayout + PlayerBar shell).
3. Buat TypeScript interfaces (`types/index.ts`).
4. Setup Zustand stores (auth, artist, player).
5. Setup Axios instance dan SWR fetcher.

**Phase 2 — Autentikasi**
6. Halaman Login User (`/login`).
7. Halaman Register User (`/register`).
8. Halaman Login Artist (`/artist/login`).
9. HOC `withAuth` dan `withArtistAuth`.
10. Middleware proteksi route.

**Phase 3 — Core User Features**
11. Halaman Home (`/home`) dengan section-section utama.
12. Halaman Search (`/search`) dengan client-side filtering.
13. Halaman Album Detail (`/album/[id]`).
14. Halaman Artist Profile (`/artist/[id]`).
15. PlayerBar dengan Howler.js integration.
16. Pencatatan Streaming History otomatis.

**Phase 4 — Playlist & Sosial**
17. Halaman Playlist Detail (`/playlist/[id]`).
18. Halaman Create Playlist (`/playlist/create`).
19. Fitur Follow (artist, user, playlist, podcast).
20. Fitur Like lagu.
21. Halaman Profile User (`/profile/[id]`).
22. Fitur Share Playlist.

**Phase 5 — Discover Weekly**
23. Implementasi kalkulasi Discover Weekly.
24. Halaman Discover Weekly (`/discover-weekly`).
25. Banner Discover Weekly di Home.

**Phase 6 — Artist Portal**
26. Artist Dashboard dengan statistik.
27. Halaman Manajemen Lagu (CRUD).
28. Halaman Manajemen Album (CRUD).
29. Halaman Analitik Streaming.
30. Halaman Galeri Foto.

**Phase 7 — Podcast**
31. Halaman Daftar Podcast.
32. Halaman Detail Podcast.
33. Form Buat Podcast.
34. Form Upload Episode.

**Phase 8 — Polish & Testing**
35. Responsive design di semua halaman.
36. Loading states & error states.
37. Toast notifications.
38. Pengujian alur end-to-end.

### 14.3 Konvensi Penamaan

| Tipe | Konvensi | Contoh |
|---|---|---|
| Komponen | PascalCase | `SongRow.tsx` |
| Halaman | kebab-case | `discover-weekly.tsx` |
| Hooks | camelCase + `use` prefix | `usePlayerStore.ts` |
| Utilities | camelCase | `formatDuration.ts` |
| Types | PascalCase | `Song`, `Artist`, `Playlist` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL` |
| CSS Classes | Tailwind utility classes | `className="flex items-center"` |

### 14.4 Warna & Tema (Spotify-like)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'spotify-green':  '#1DB954',
        'spotify-black':  '#121212',
        'spotify-dark':   '#181818',
        'spotify-card':   '#282828',
        'spotify-hover':  '#3E3E3E',
        'spotify-text':   '#FFFFFF',
        'spotify-muted':  '#B3B3B3',
        'spotify-border': '#404040',
      },
      fontFamily: {
        sans: ['Circular Std', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
};
```

---

## Appendix

### A. Catatan Penting

1. **Audio URL:** Skema database `Song` tidak memiliki kolom `audio_url`. Untuk demo, gunakan file audio sample (misalnya dari `https://www.soundhelix.com/examples/mp3/`). Tambahkan field `audio_url` di tabel Song di backend untuk versi final.

2. **Password Security:** Implementasi autentikasi saat ini bersifat client-side dan tidak aman untuk produksi. Tambahkan Laravel Sanctum + bcrypt untuk hash password di iterasi berikutnya.

3. **Endpoint Sosial:** Banyak endpoint fitur sosial (follow, like) belum tersedia di backend. Perlu ditambahkan di Laravel controller sebelum fitur-fitur ini bisa diimplementasikan secara penuh.

4. **CORS:** Pastikan CORS dikonfigurasi di Laravel agar request dari `http://localhost:3000` diizinkan. Tambahkan di `config/cors.php`:
   ```php
   'allowed_origins' => ['http://localhost:3000'],
   ```

5. **Discover Weekly:** Karena tidak ada cronjob di frontend, kalkulasi Discover Weekly dilakukan setiap kali halaman dimuat. Pertimbangkan menambahkan endpoint khusus di Laravel (`GET /api/discover-weekly`) yang sudah menghitung top 50 dari sisi server.

### B. Referensi

- [Next.js Pages Router Documentation](https://nextjs.org/docs/pages)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [SWR Documentation](https://swr.vercel.app/)
- [Howler.js Documentation](https://howlerjs.com/)
- [Laravel 11 Documentation](https://laravel.com/docs/11.x)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)