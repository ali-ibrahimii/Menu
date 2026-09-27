"use client";
/* eslint-disable @next/next/no-img-element -- Public Storage URLs; no image optimizer required for admin previews. */
import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { IMAGE_BUCKET, imageExtensions, validateImage } from "@/lib/mediaPaths";
import { listImages, type StorageImage } from "@/lib/storageImages";

export default function ImageManager({
  folder,
  avatar = false,
}: {
  folder: string;
  avatar?: boolean;
}) {
  const [images, setImages] = useState<StorageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const request = useRef(0);
  const load = useCallback(async () => {
    const id = ++request.current;
    setLoading(true);
    setError("");
    try {
      const result = await listImages(folder);
      if (id === request.current) setImages(result);
    } catch {
      if (id === request.current)
        setError(
          "دریافت تصاویر انجام نشد. اتصال و مجوز SELECT در Storage را بررسی کنید.",
        );
    } finally {
      if (id === request.current) setLoading(false);
    }
  }, [folder]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    return () => {
      // Invalidate async requests on unmount; this is a counter, not a DOM ref.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      request.current++;
    };
  }, [load]);
  useEffect(() => {
    if (!pending) return;
    const url = URL.createObjectURL(pending);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pending]);
  async function upload() {
    if (!pending || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      // Decode before upload as well as checking MIME/size; reject corrupt images.
      const bitmap = await createImageBitmap(pending);
      bitmap.close();
      const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${imageExtensions[pending.type]}`;
      const { error } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, pending, {
          upsert: false,
          contentType: pending.type,
          cacheControl: "3600",
        });
      if (error) throw error;
      setPending(null);
      setPreview("");
      if (input.current) input.current.value = "";
      setNotice(
        avatar
          ? "آواتار جدید ذخیره شد. آخرین تصویر بارگذاری‌شده در سایت نمایش داده می‌شود."
          : "تصویر بارگذاری شد.",
      );
      await load();
    } catch {
      setError(
        "بارگذاری انجام نشد. معتبر بودن تصویر، اتصال و مجوز INSERT در Storage را بررسی کنید.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function remove(image: StorageImage) {
    if (
      lock.current ||
      !window.confirm(
        `تصویر «${image.name}» برای همیشه حذف شود؟${avatar ? " اگر تصویر دیگری باقی بماند، جدیدترین آن آواتار خواهد شد." : ""}`,
      )
    )
      return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data, error } = await supabase.storage
        .from(IMAGE_BUCKET)
        .remove([image.path]);
      if (error || !data?.length) throw error ?? new Error("No image deleted");
      setNotice("تصویر حذف شد.");
      await load();
    } catch {
      setError("حذف انجام نشد. اتصال و مجوز DELETE در Storage را بررسی کنید.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="space-y-4" aria-busy={busy || loading}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          پوشه:{" "}
          <bdi>
            {IMAGE_BUCKET}/{folder}
          </bdi>
        </p>
        <Button
          type="button"
          variant="ghost"
          disabled={busy || loading}
          onClick={load}
        >
          <RefreshCw size={15} />
          بازخوانی
        </Button>
      </div>
      {avatar && (
        <p className="text-sm leading-7 text-slate-500">
          تصویر جدید، آواتار فعلی می‌شود. تصاویر قبلی تا زمان حذف در آرشیو باقی
          می‌مانند.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400"
        >
          {notice}
        </p>
      )}
      <div className="rounded-xl border border-dashed border-slate-300 p-4 dark:border-white/20">
        <label className="block space-y-3">
          <span className="flex items-center gap-2 font-medium">
            <ImagePlus size={20} />
            {avatar ? "انتخاب آواتار جدید" : "افزودن تصویر"}
          </span>
          <span className="block text-xs text-slate-500">
            JPG، PNG یا WebP، حداکثر ۵ مگابایت. تغییرات تصاویر مستقل از فرم
            اطلاعات ذخیره می‌شوند.
          </span>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy || loading}
            className="block w-full text-sm file:ml-3 file:rounded-lg file:border-0 file:bg-emerald-500/10 file:p-2 file:text-emerald-600"
            onChange={(event) => {
              setNotice("");
              const file = event.target.files?.[0];
              setPending(null);
              setPreview("");
              if (!file) return;
              const message = validateImage(file);
              setError(message ?? "");
              if (message) {
                event.target.value = "";
                return;
              }
              setPending(file);
            }}
          />
        </label>
        {pending && (
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {preview && (
              <img
                src={preview}
                alt="پیش‌نمایش تصویر انتخاب‌شده"
                className="h-24 w-24 rounded-xl object-cover"
              />
            )}
            <p dir="auto" className="max-w-60 break-all text-xs">
              {pending.name}
            </p>
            <Button
              type="button"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={busy || loading}
              onClick={upload}
            >
              {busy ? "در حال بارگذاری…" : "بارگذاری و ذخیره"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setPending(null);
                setPreview("");
                if (input.current) input.current.value = "";
              }}
            >
              انصراف
            </Button>
          </div>
        )}
      </div>
      {loading ? (
        <p role="status" className="py-6 text-center text-sm">
          در حال دریافت تصاویر…
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <article
              key={image.path}
              className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10"
            >
              <a
                href={image.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`نمایش تصویر ${image.name}`}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  loading="lazy"
                  className={`aspect-square w-full object-cover ${avatar && index === 0 ? "ring-2 ring-inset ring-emerald-500" : ""}`}
                />
              </a>
              <div className="space-y-2 p-3">
                {avatar && (
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {index === 0 ? "آواتار فعلی" : "آرشیو"}
                  </p>
                )}
                <p dir="auto" className="truncate text-xs" title={image.name}>
                  {image.name}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    {Math.ceil(image.size / 1024).toLocaleString("fa-IR")} KB
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                    disabled={busy}
                    onClick={() => remove(image)}
                    aria-label={`حذف ${image.name}`}
                  >
                    <Trash2 size={15} />
                    حذف
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && !error && images.length === 0 && (
        <p className="py-6 text-center text-sm text-slate-500">
          هنوز تصویری در این پوشه نیست.
        </p>
      )}
    </div>
  );
}
