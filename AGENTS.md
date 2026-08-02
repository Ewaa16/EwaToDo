# AGENTS.md

Personal to-do web app ("EwaToDo") — Next.js 16 (App Router), TypeScript, Tailwind CSS 4, UI in Bahasa Indonesia.

## Commands

Windows PowerShell blocks `npm.ps1`. Always run npm through cmd:
- `cmd /c "npm run dev -- -p 3100"` — dev server (default port; 3000 is occupied by the sibling `portfolio-ewa` project, never use it)
- `cmd /c "npm run build"`, `cmd /c "npm run lint"`, `cmd /c "npm start -- -p 3100"`

## Stack notes (verified)

- **DB**: `@libsql/client` (libSQL, SQLite fork). Prod memakai **Turso cloud** (`TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`); dev lokal tanpa env tersebut memakai file `./data/local.db` (gitignored) via driver yang sama. Skema (`CREATE TABLE IF NOT EXISTS`) dijalankan `initDb()` di `lib/db.ts` — TLA, idempotent. Semua fungsi DB **async** (libSQL over HTTP di prod) — jangan dipakai tanpa `await`.
- **Auth**: NextAuth v5 beta (`next-auth@beta`) with Google + Credentials (email/password). bcryptjs for hashing (pure JS — do not switch to native `bcrypt`).
- **Routes**: `/login`, `/register` (auth group) · `/`, `/tasks`, `/stats` (`(app)` group).
- **Auth env**: `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` in `.env.local` (gitignored; template in `.env.example`). Google OAuth callback: `/api/auth/callback/google`.

## Gotchas

- **Next 16 renamed `middleware.ts` → `proxy.ts`.** This repo deliberately does NOT use middleware/proxy; route protection happens in `app/(app)/layout.tsx` via `auth()` + `redirect("/login")`. Keep it that way.
- **`app/api/auth/[...nextauth]/route.ts` has `export const dynamic = "force-dynamic"`** — Next 16 Data Cache caches GET route handlers by default, which would leak one user's session to all users. Do not remove.
- Use `auth()` in server components, never `getSession()` (Data Cache).
- **`AUTH_URL`** (NextAuth base URL): kalau di-set di Vercel harus **persis** domain tanpa trailing slash (`https://<proyek>.vercel.app`) — salah nilai = Google login gagal `redirect_uri_mismatch` karena NextAuth memakai AUTH_URL untuk membangun callback. Alternatif teraman: **jangan set `AUTH_URL` sama sekali** — karena `trustHost: true`, NextAuth otomatis mendeteksi host dari header request (works di localhost & Vercel).
- **Server actions used with `useActionState` must be `(prevState, formData) => Promise<{error?: string}>`.** `editTaskAction` is bound with `.bind(null, task.id)` in `TaskItem.tsx`.
- All task queries in `lib/db.ts` are scoped by `user_id` — keep that when adding queries.
- "Hari ini" / stats use **Asia/Jakarta explicitly** via `lib/jakarta.ts` (`jakartaParts()` → `Intl.DateTimeFormat` with `timeZone: "Asia/Jakarta"`), dipakai oleh `lib/db.ts` (`localToday`, `formatLocalDate`, `localNowString`, `getWeeklyStats`) dan `lib/format.ts` (`localDateNow`, `greetingByHour`, `todayLabel`). Do NOT rely on server-local time or env `TZ`: Vercel reserves the `TZ` env var and its functions always run UTC — hard-coded Jakarta is required so dates don't shift.

## Security & reliability (verified)

- **Security headers** live in `next.config.ts` (`headers()` global): CSP (`script-src` includes `'unsafe-inline'`; `'unsafe-eval'` added only in dev for React Refresh), HSTS, `frame-ancestors 'none'`, etc. `poweredByHeader: false`.
- **Rate limiting** in `lib/rate-limit.ts` — **berbasis tabel `rate_limits` di DB** (libSQL/Turso), bukan in-memory (memory tidak persisten di serverless Vercel). Login blocked after 5 failed attempts per email / 15 min; register 3 per IP / hour. Applied in `actions/auth.ts` via `await isRateLimited`/`await recordAttempt`/`await clearRateLimit`.
- Password minimum is **8 chars** (zod in `actions/auth.ts` + form attrs). Register returns a generic error (no account-existence leak).
- `auth.ts` throws at import if `AUTH_SECRET` is missing (fail-fast). Session `maxAge` is 7 days. `trustHost: true` is intentional for hosting behind a proxy / non-Vercel host.
- **DB** di `lib/db.ts`: skema dibuat idempotent oleh `initDb()` (users, tasks + indeks, rate_limits; FK `tasks.user_id → users ON DELETE CASCADE`). Tidak ada backup file lokal (`VACUUM INTO` tidak berlaku untuk Turso remote) — andalkan **Turso Point-in-Time Restore** (1 hari di free tier).
- Error pages: `app/error.tsx` (root boundary + retry), `app/global-error.tsx`, `app/not-found.tsx`. Server actions wrap DB calls in try/catch and return `{error}` instead of crashing.
- **`npm audit` residual (known, no clean fix):** 3 "high" from `next`'s bundled `postcss`/`sharp`. Next is already latest (16.2.12); `npm audit fix --force` would wrongly downgrade to next@9 — do NOT run it. `sharp` is only exercised by `next/image` (unused here); postcss is build-time.
- After deploy (Vercel): set `AUTH_URL=https://<proyek>.vercel.app` (atau lebih aman: **jangan set AUTH_URL** sama sekali — `trustHost` mendeteksi host otomatis), regenerate `AUTH_SECRET`, tambah Google OAuth redirect URI `https://<proyek>.vercel.app/api/auth/callback/google`, ubah consent screen ke **Production** (scope profile/email tidak butuh verifikasi), dan isi `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`. Jangan isi `TZ` — Vercel menolak (reserved) dan zona waktu sudah di-hard-code Asia/Jakarta di kode.

## Verification

Full flow verified: register → credentials login → add/edit/toggle/delete task → weekly stats. Add new features and re-run `npm run lint` + `npm run build` before finishing.
