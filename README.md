# EwaToDo 🗒️

To-do list web untuk mencatat tugas harian — Next.js 16 (App Router), TypeScript, Tailwind CSS 4. UI dalam Bahasa Indonesia.

## Fitur

- 🔐 Login Google atau email/password (NextAuth v5, data terpisah per akun)
- ➕ Tambah / edit / hapus / tandai selesai tugas
- 🏷️ Kategori, prioritas (rendah/sedang/tinggi), dan tanggal jatuh tempo
- 📊 Statistik mingguan 7 hari terakhir (grafik batang)

## Menjalankan

Port **3100** digunakan karena port 3000 dipakai project lain (`portfolio-ewa`).

```bash
npm run dev -- -p 3100
```

Buka [http://localhost:3100](http://localhost:3100), lalu daftar akun atau masuk.

## Konfigurasi

Salin `.env.example` ke `.env.local`:

| Variabel | Keterangan |
| --- | --- |
| `AUTH_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `AUTH_URL` | `http://localhost:3100` (dev) / `https://<proyek>.vercel.app` (prod) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Client ID & Secret Google OAuth (lihat bawah) |
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | Turso (libSQL) — wajib di prod, opsional di dev (tanpa keduanya dev memakai file `./data/local.db`) |

Catatan zona waktu: logika "hari ini"/statistik di-hard-code **Asia/Jakarta** (`lib/jakarta.ts`) — tidak perlu (dan tidak bisa, di Vercel) mengatur env `TZ`.

### Setup Login Google

1. [Google Cloud Console](https://console.cloud.google.com) → buat project → **APIs & Services → OAuth consent screen** (External)
2. **Credentials → Create Credentials → OAuth Client ID** → tipe **Web application**
3. **Authorized redirect URIs**: `http://localhost:3100/api/auth/callback/google` (dev) dan `https://<proyek>.vercel.app/api/auth/callback/google` (prod)
4. Isi `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET` di `.env.local`

Login email/password tetap berfungsi penuh tanpa setup Google.

## Database

[Turso](https://turso.tech) (libSQL — SQLite fork) via `@libsql/client`. Semua query async (libSQL over HTTP di prod); jangan dipakai tanpa `await`.

- **Prod**: isi `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` (buat di turso.tech, gratis).
- **Dev lokal**: tanpa env tersebut, otomatis memakai file `./data/local.db` (gitignored) dengan driver yang sama — hapus file itu untuk reset data dev.
- Skema dibuat otomatis & idempotent (`CREATE TABLE IF NOT EXISTS`) di `lib/db.ts`.
- Tidak ada backup file lokal — andalkan **Turso Point-in-Time Restore** (1 hari di free tier).

## Keamanan & keandalan

- Security headers global (CSP, HSTS, `frame-ancestors 'none'`, dll.) di `next.config.ts`
- Rate limiting (persisten di DB): login maks 5 percobaan gagal/15 menit per email; register 3/jam per IP
- Password minimal 8 karakter; hash bcryptjs
- SQL injection aman (prepared statements), semua data tersaring per `user_id`
- Error boundary (`error.tsx`), halaman 404 custom, server action tidak crash
- Catatan: `npm audit` masih melaporkan 3 "high" dari dependency bawaan `next` (postcss/sharp) — tanpa fix bersih, jangan jalankan `npm audit fix --force` (akan men-downgrade ke next@9)

## Deploy (Vercel — gratis)

1. Buat database Turso di [turso.tech](https://turso.tech) → catat `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`.
2. Push kode ke GitHub, import ke **Vercel** (Framework: Next.js — otomatis terdeteksi).
3. Set environment variables di Vercel → Project → Settings → Environment Variables: `AUTH_SECRET` (baru), `AUTH_URL=https://<proyek>.vercel.app`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`. (Jangan isi `TZ` — di-reserved Vercel; zona waktu sudah hard-code Asia/Jakarta di kode.)
4. Deploy. Tambahkan redirect URI Google `https://<proyek>.vercel.app/api/auth/callback/google`, lalu ubah OAuth consent screen ke **Production** (scope profile/email tidak perlu verifikasi).
5. Buka `https://<proyek>.vercel.app` — HTTPS otomatis, gratis.
