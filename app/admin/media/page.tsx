"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Images } from "lucide-react";
import ImageManager from "@/components/admin/ImageManager";
import { supabase } from "@/lib/supabaseClient";
import { getFolderForBranch } from "@/lib/mediaPaths";
import { Button } from "@/components/ui/button";

type Folder = { path: string; label: string };
const defaults: Folder[] = [
  { path: "gallery", label: "گالری مجموعه" },
  { path: "first-branch", label: "شعبه اول" },
  { path: "second-branch", label: "شعبه دوم" },
  { path: "shop", label: "سوغات وطندار" },
];
export default function MediaPage() {
  const [folders, setFolders] = useState(defaults);
  const [selected, setSelected] = useState("gallery");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data, error } = await supabase
          .from("branches")
          .select("slug,name_fa")
          .order("created_at");
        if (error) throw error;
        const mapped = new Map(defaults.map((f) => [f.path, f]));
        for (const b of data ?? []) {
          const path = getFolderForBranch(b.slug);
          mapped.set(path, { path, label: b.name_fa });
        }
        if (!cancelled) {
          setFolders([...mapped.values()]);
          setError("");
        }
      } catch {
        if (!cancelled)
          setError(
            "فهرست شعبه‌ها دریافت نشد؛ پوشه‌های اصلی همچنان در دسترس هستند.",
          );
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [retry]);
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-8"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="flex items-center gap-3 text-2xl font-black">
            <Images />
            مدیریت تصاویر
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            تصاویر شعبه‌ها و گالری، در پوشه‌های جدا و هماهنگ با سایت
          </p>
        </header>
        {error && (
          <div role="alert" className="rounded-xl bg-amber-500/10 p-4 text-sm">
            {error}
            <Button variant="ghost" onClick={() => setRetry((v) => v + 1)}>
              تلاش دوباره
            </Button>
          </div>
        )}
        <label className="block space-y-2 text-sm">
          <span>انتخاب گالری یا شعبه</span>
          <select
            className="block w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-white/15 dark:bg-slate-900 sm:max-w-sm"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {folders.map((f) => (
              <option key={f.path} value={f.path}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
          <h2 className="mb-3 text-lg font-bold">
            {folders.find((f) => f.path === selected)?.label}
          </h2>
          <ImageManager key={selected} folder={selected} />
        </section>
      </div>
    </main>
  );
}
