"use client";

import { useActionState, useRef, useState } from "react";
import {
  removeProfileImageAction,
  updateProfileImageAction,
  type ProfileActionState,
} from "@/actions/profile";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB file asli
const MAX_PX = 256;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File gagal dibaca."));
    reader.onload = () => {
      const img = new Image();
      const timer = setTimeout(() => {
        reject(new Error("Gambar gagal diproses. Coba format JPG/PNG/WebP lain."));
      }, 10_000);
      img.onerror = () => {
        clearTimeout(timer);
        reject(new Error("Gambar gagal dibaca. Coba file lain."));
      };
      img.onload = () => {
        clearTimeout(timer);
        let { width, height } = img;
        if (width > height && width > MAX_PX) {
          height = Math.round((height * MAX_PX) / width);
          width = MAX_PX;
        } else if (height >= width && height > MAX_PX) {
          width = Math.round((width * MAX_PX) / height);
          height = MAX_PX;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas tidak didukung di browser ini."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function Avatar({
  image,
  name,
  size,
}: {
  image?: string | null;
  name?: string | null;
  size: string;
}) {
  const initial = (name ?? "?").charAt(0).toUpperCase();
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name ?? "Foto profil"}
        className={`${size} rounded-full object-cover ring-4 ring-indigo-100 dark:ring-indigo-500/30`}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <span
      className={`${size} inline-flex items-center justify-center rounded-full bg-indigo-600 font-bold text-white`}
    >
      {initial}
    </span>
  );
}

export function ProfileForm({
  image,
  name,
  email,
}: {
  image: string | null;
  name: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(
    updateProfileImageAction,
    {}
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    setFileError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileError("File harus berupa gambar.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setFileError("Ukuran file maksimal 5 MB.");
      return;
    }
    try {
      const dataUrl = await resizeImage(file);
      setPreview(dataUrl);
    } catch (e) {
      setFileError(e instanceof Error ? e.message : "Gagal memproses gambar.");
    }
  }

  const current = preview ?? image;
  const dirty = preview !== null && preview !== image;

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-indigo-100/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
      <div className="flex flex-col items-center">
        <Avatar key={current ?? "none"} image={current} name={name} size="h-24 w-24 text-4xl" />
        <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          {name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{email}</p>
      </div>

      <div className="mt-6 space-y-4">
        <input
          ref={inputRef}
          id="profile-image"
          name="image-file"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <label
          htmlFor="profile-image"
          className="block w-full cursor-pointer rounded-lg border border-dashed border-slate-300 px-4 py-3 text-center text-sm font-medium text-slate-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
        >
          {dirty ? "Ganti foto…" : "Pilih foto profil"}
        </label>
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Format JPG/PNG/WebP, maksimal 5 MB. Otomatis diperkecil.
        </p>

        {fileError && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            {fileError}
          </p>
        )}
        {state.error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            {state.success}
          </p>
        )}

        <form action={formAction} className="space-y-3">
          <input type="hidden" name="image" value={current ?? ""} />
          <button
            type="submit"
            disabled={pending || !dirty}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Menyimpan…" : "Simpan foto"}
          </button>
        </form>

        {dirty && (
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setFileError(null);
            }}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Batal
          </button>
        )}

        {image && !dirty && (
          <form action={removeProfileImageAction}>
            <button
              type="submit"
              className="w-full rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
            >
              Hapus foto profil
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
