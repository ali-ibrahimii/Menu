"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Building2,
  Check,
  Clock,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Users,
} from "lucide-react";
import ImageManager from "@/components/admin/ImageManager";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  languages,
  emptyBranch,
  emptyPublic,
  toDraft,
  nullableText,
  validateBranch,
  databaseError,
  type BranchDraft,
  type BranchRecord,
  type PublicDraft,
  type PublicRecord,
} from "@/lib/branchManagement";

const card =
  "rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900";
const input =
  "w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/15 disabled:opacity-50";
const primary = "bg-emerald-600 text-white hover:bg-emerald-700";

function Field({
  label,
  value,
  onChange,
  multiline = false,
  ltr = false,
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  ltr?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="text-slate-600 dark:text-slate-300">
        {label}
        {required && <span className="text-emerald-500"> *</span>}
      </span>
      {multiline ? (
        <textarea
          className={input}
          rows={3}
          dir={ltr ? "ltr" : "rtl"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={input}
          dir={ltr ? "ltr" : "rtl"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}
function ErrorBox({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div
      role="alert"
      className="my-3 flex flex-wrap items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300"
    >
      {message}
      {retry && (
        <Button variant="outline" onClick={retry}>
          تلاش دوباره
        </Button>
      )}
    </div>
  );
}

export default function BranchManagementPage() {
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [info, setInfo] = useState<PublicRecord | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [branchError, setBranchError] = useState("");
  const [infoError, setInfoError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingBranch, setEditingBranch] = useState<BranchRecord | null>(null);
  const [branchDraft, setBranchDraft] = useState<BranchDraft>(emptyBranch);
  const [branchOpen, setBranchOpen] = useState(false);
  const [branchSaveError, setBranchSaveError] = useState("");
  const [savingBranch, setSavingBranch] = useState(false);
  const [publicDraft, setPublicDraft] = useState<PublicDraft>(emptyPublic);
  const [editingInfo, setEditingInfo] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSaveError, setInfoSaveError] = useState("");
  const branchLock = useRef(false);
  const infoLock = useRef(false);

  const loadBranches = useCallback(async () => {
    setLoadingBranches(true);
    setBranchError("");
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("created_at");
      if (error) throw error;
      setBranches(data ?? []);
    } catch (error) {
      setBranchError(databaseError(error));
    } finally {
      setLoadingBranches(false);
    }
  }, []);
  const loadInfo = useCallback(async () => {
    setLoadingInfo(true);
    setInfoError("");
    try {
      // Do not silently pick an arbitrary row when the shared settings are ambiguous.
      const { data, error } = await supabase
        .from("public_info")
        .select("*")
        .limit(2);
      if (error) throw error;
      if (data && data.length > 1) {
        setInfoError(
          "بیش از یک رکورد اطلاعات عمومی وجود دارد. ابتدا رکورد مشترک را در سوپابیس مشخص کنید؛ برای جلوگیری از ویرایش اشتباه، ذخیره غیرفعال است.",
        );
        return;
      }
      setInfo(data?.[0] ?? null);
    } catch (error) {
      setInfoError(databaseError(error));
    } finally {
      setLoadingInfo(false);
    }
  }, []);
  useEffect(() => {
    // Initial remote fetch; the callbacks also manage retry loading states.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadBranches();
    void loadInfo();
  }, [loadBranches, loadInfo]);

  const startBranch = (branch: BranchRecord | null) => {
    setEditingBranch(branch);
    setBranchDraft(branch ? toDraft(emptyBranch, branch) : { ...emptyBranch });
    setBranchSaveError("");
    setNotice("");
    setBranchOpen(true);
  };
  const closeBranch = () => {
    if (branchLock.current) return;
    const original = editingBranch
      ? toDraft(emptyBranch, editingBranch)
      : emptyBranch;
    if (
      JSON.stringify(original) !== JSON.stringify(branchDraft) &&
      !window.confirm("تغییرات ذخیره نشده کنار گذاشته شود؟")
    )
      return;
    setBranchOpen(false);
  };
  async function saveBranch(event: React.FormEvent) {
    event.preventDefault();
    if (branchLock.current) return;
    const validation = validateBranch(branchDraft);
    if (validation) {
      setBranchSaveError(validation);
      return;
    }
    if (
      branches.some(
        (b) => b.id !== editingBranch?.id && b.slug === branchDraft.slug.trim(),
      )
    ) {
      setBranchSaveError("این شناسه قبلاً ثبت شده است.");
      return;
    }
    branchLock.current = true;
    setSavingBranch(true);
    setBranchSaveError("");
    try {
      const payload = {
        ...nullableText(branchDraft),
        latitude: branchDraft.latitude.trim()
          ? Number(branchDraft.latitude)
          : null,
        longitude: branchDraft.longitude.trim()
          ? Number(branchDraft.longitude)
          : null,
      };
      const query = editingBranch
        ? supabase.from("branches").update(payload).eq("id", editingBranch.id)
        : supabase
            .from("branches")
            .insert({ ...payload, id: crypto.randomUUID() });
      const { data, error } = await query.select("*").single();
      if (error) throw error;
      setBranches((current) =>
        editingBranch
          ? current.map((b) => (b.id === editingBranch.id ? data : b))
          : [...current, data],
      );
      setBranchOpen(false);
      setNotice(
        editingBranch ? "اطلاعات شعبه ذخیره شد." : "شعبه جدید اضافه شد.",
      );
    } catch (error) {
      setBranchSaveError(databaseError(error));
    } finally {
      branchLock.current = false;
      setSavingBranch(false);
    }
  }
  async function saveInfo(event: React.FormEvent) {
    event.preventDefault();
    if (infoLock.current || infoError) return;
    infoLock.current = true;
    setSavingInfo(true);
    setInfoSaveError("");
    try {
      const payload = nullableText(publicDraft);
      const query = info
        ? supabase.from("public_info").update(payload).eq("id", info.id)
        : supabase
            .from("public_info")
            .insert({ ...payload, id: crypto.randomUUID() });
      const { data, error } = await query.select("*").single();
      if (error) throw error;
      setInfo(data);
      setEditingInfo(false);
      setNotice("اطلاعات عمومی ذخیره شد.");
    } catch (error) {
      setInfoSaveError(databaseError(error));
    } finally {
      infoLock.current = false;
      setSavingInfo(false);
    }
  }
  const visible = branches.filter(
    (b) =>
      (filter === "all" ||
        (filter === "active" ? b.is_active : !b.is_active)) &&
      [
        b.name_fa,
        b.name_ar,
        b.name_en,
        b.slug,
        b.phone_1,
        b.phone_2,
        b.address_fa,
      ].some((v) => v?.toLowerCase().includes(search.trim().toLowerCase())),
  );
  const updateBranch = (key: keyof BranchDraft, value: string | boolean) =>
    setBranchDraft((d) => ({ ...d, [key]: value }));
  const updateInfo = (key: keyof PublicDraft, value: string) =>
    setPublicDraft((d) => ({ ...d, [key]: value }));

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-8"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black sm:text-3xl">
              شعبه‌ها و اطلاعات عمومی
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              اطلاعات هر شعبه و اطلاعات مشترک مجموعه.
            </p>
          </div>
          <Button
            className={primary}
            disabled={loadingBranches || !!branchError}
            onClick={() => startBranch(null)}
          >
            <Plus size={18} />
            افزودن شعبه
          </Button>
        </header>
        {notice && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400"
          >
            <Check size={18} />
            {notice}
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          {[
            ["همه شعبه‌ها", branches.length, Building2],
            [
              "شعبه‌های فعال",
              branches.filter((b) => b.is_active).length,
              Check,
            ],
            [
              "فعال و باز",
              branches.filter((b) => b.is_active && b.is_open).length,
              Clock,
            ],
          ].map(([label, count, Icon]) => {
            const StatIcon = Icon as typeof Building2;
            return (
              <div key={String(label)} className={card}>
                <StatIcon className="mb-3 text-emerald-500" size={22} />
                <p className="text-2xl font-black">
                  {loadingBranches || branchError
                    ? "—"
                    : Number(count).toLocaleString("fa-IR")}
                </p>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {String(label)}
                </p>
              </div>
            );
          })}
        </div>
        <section aria-labelledby="branches-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2
              id="branches-heading"
              className="flex items-center gap-2 text-lg font-bold"
            >
              <Building2 size={20} />
              شعبه‌ها
            </h2>
            <Button
              variant="ghost"
              disabled={loadingBranches}
              onClick={loadBranches}
            >
              <RefreshCw
                size={16}
                className={loadingBranches ? "animate-spin" : ""}
              />
              بازخوانی
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="relative min-w-52 flex-1">
              <span className="sr-only">جستجوی شعبه</span>
              <Search
                size={18}
                className="absolute right-3 top-3 text-slate-400"
              />
              <input
                className={`${input} pr-10`}
                placeholder="جستجوی نام، شناسه، آدرس یا شماره تماس…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <select
              aria-label="فیلتر وضعیت شعبه"
              className={`${input} w-auto`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </div>
          {branchError ? (
            <ErrorBox message={branchError} retry={loadBranches} />
          ) : loadingBranches ? (
            <p role="status" className={`${card} text-center`}>
              در حال دریافت شعبه‌ها…
            </p>
          ) : visible.length === 0 ? (
            <div className={`${card} py-12 text-center text-slate-500`}>
              {branches.length
                ? "شعبه‌ای با این جستجو پیدا نشد."
                : "هنوز شعبه‌ای ثبت نشده است. از دکمه افزودن شعبه استفاده کنید."}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {visible.map((b) => (
                <article key={b.id} className={`${card} flex flex-col gap-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{b.name_fa}</h3>
                      <p
                        dir="ltr"
                        className="mt-1 text-start text-xs text-slate-500"
                      >
                        {b.slug}
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span
                        className={`rounded-full px-2 py-1 ${b.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-500/10 text-slate-500"}`}
                      >
                        {b.is_active ? "فعال" : "غیرفعال"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 ${b.is_open ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-600"}`}
                      >
                        {b.is_open ? "باز" : "بسته"}
                      </span>
                    </div>
                  </div>
                  <p className="flex gap-2 text-sm text-slate-500">
                    <MapPin size={17} className="shrink-0" />
                    {b.address_fa || "آدرس ثبت نشده"}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-2">
                      <Phone size={16} className="text-slate-400" />
                      <span dir="ltr">
                        {[b.phone_1, b.phone_2].filter(Boolean).join(" / ") ||
                          "—"}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock size={16} className="text-slate-400" />
                      {b.open || "—"} تا {b.close || "—"}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3 dark:border-white/10">
                    <span className="text-xs text-slate-500">
                      {b.latitude != null && b.longitude != null ? (
                        <span dir="ltr">
                          {b.latitude}, {b.longitude}
                        </span>
                      ) : (
                        "موقعیت ثبت نشده"
                      )}
                    </span>
                    <Button variant="outline" onClick={() => startBranch(b)}>
                      <Pencil size={15} />
                      نمایش و ویرایش
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <section aria-labelledby="public-heading" className={card}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2
                id="public-heading"
                className="flex items-center gap-2 text-lg font-bold"
              >
                اطلاعات عمومی و مدیریت
              </h2>
            </div>
            {!editingInfo && (
              <Button
                variant="outline"
                disabled={loadingInfo || !!infoError}
                onClick={() => {
                  setPublicDraft(
                    info ? toDraft(emptyPublic, info) : { ...emptyPublic },
                  );
                  setEditingInfo(true);
                  setInfoSaveError("");
                  setNotice("");
                }}
              >
                <Pencil size={16} />
                {info ? "ویرایش اطلاعات" : "ثبت اطلاعات"}
              </Button>
            )}
          </div>
          <div className="mb-8 rounded-xl border border-slate-200 p-4 dark:border-white/10">
            <h3 className="mb-3 font-bold">آواتار مدیریت</h3>
            <ImageManager folder="avatar" avatar />
          </div>
          {infoError ? (
            <ErrorBox message={infoError} retry={loadInfo} />
          ) : loadingInfo ? (
            <p role="status">در حال دریافت اطلاعات عمومی…</p>
          ) : editingInfo ? (
            <form onSubmit={saveInfo}>
              <fieldset disabled={savingInfo} className="space-y-6">
                <div className="max-w-sm">
                  <Field
                    label="شماره تماس مدیریت"
                    value={publicDraft.manager_number}
                    onChange={(v) => updateInfo("manager_number", v)}
                    ltr
                  />
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                  {languages.map((lang) => (
                    <div
                      key={lang.code}
                      className="space-y-4 rounded-xl bg-slate-50 p-4 dark:bg-white/5"
                    >
                      <h3 className="font-bold">{lang.label}</h3>
                      {(
                        [
                          ["manager_name", "نام مدیر", false],
                          ["manager_description", "توضیحات مدیریت", true],
                          ["manager_office", "دفتر مدیریت", true],
                          ["about", "درباره ما", true],
                        ] as const
                      ).map(([key, label, multiline]) => (
                        <Field
                          key={key}
                          label={label}
                          value={publicDraft[`${key}_${lang.code}`]}
                          onChange={(v) => updateInfo(`${key}_${lang.code}`, v)}
                          multiline={multiline}
                          ltr={lang.code === "en"}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                {infoSaveError && <ErrorBox message={infoSaveError} />}
                <div className="flex gap-3">
                  <Button type="submit" className={primary}>
                    <Save size={16} />
                    {savingInfo ? "در حال ذخیره…" : "ذخیره اطلاعات عمومی"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (
                        JSON.stringify(publicDraft) ===
                          JSON.stringify(
                            info ? toDraft(emptyPublic, info) : emptyPublic,
                          ) ||
                        window.confirm("تغییرات ذخیره نشده کنار گذاشته شود؟")
                      )
                        setEditingInfo(false);
                    }}
                  >
                    انصراف
                  </Button>
                </div>
              </fieldset>
            </form>
          ) : !info ? (
            <p className="text-sm text-slate-500">
              اطلاعات عمومی هنوز ثبت نشده است.
            </p>
          ) : (
            <>
              <p className="mb-5 flex items-center gap-2 text-sm">
                <Phone size={16} />
                شماره مدیریت:{" "}
                <span dir="ltr">{info.manager_number || "—"}</span>
              </p>
              <div className="grid gap-6 lg:grid-cols-3">
                {languages.map((lang) => (
                  <div
                    key={lang.code}
                    className="rounded-xl bg-slate-50 p-4 dark:bg-white/5"
                  >
                    <h3 className="mb-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {lang.label}
                    </h3>
                    <dl className="space-y-4">
                      {(
                        [
                          ["manager_name", "نام مدیر"],
                          ["manager_description", "توضیحات مدیریت"],
                          ["manager_office", "دفتر مدیریت"],
                          ["about", "درباره ما"],
                        ] as const
                      ).map(([key, label]) => (
                        <div key={key}>
                          <dt className="mb-1 text-xs text-slate-500">
                            {label}
                          </dt>
                          <dd
                            dir={lang.code === "en" ? "ltr" : "rtl"}
                            className="whitespace-pre-wrap break-words text-sm leading-7"
                          >
                            {info[`${key}_${lang.code}`] || "—"}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
      <Dialog
        open={branchOpen}
        onOpenChange={(open) => {
          if (!open) closeBranch();
        }}
      >
        <DialogContent
          dir="rtl"
          showCloseButton={!savingBranch}
          className="max-h-[90dvh] overflow-y-auto bg-white text-slate-900 dark:bg-slate-900 dark:text-white sm:max-w-3xl"
        >
          <DialogTitle className="pt-3 text-right">
            {editingBranch
              ? `ویرایش ${editingBranch.name_fa}`
              : "افزودن شعبه جدید"}
          </DialogTitle>
          <DialogDescription className="text-right">
            نام فارسی و شناسه الزامی هستند. سایر اطلاعات را می‌توانید بعداً
            تکمیل کنید.
          </DialogDescription>
          <form onSubmit={saveBranch}>
            <fieldset disabled={savingBranch} className="space-y-6">
              <Field
                label="شناسه یکتا (slug)"
                value={branchDraft.slug}
                onChange={(v) => updateBranch("slug", v)}
                required
                ltr
                placeholder="branch3"
              />
              {editingBranch && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  تغییر شناسه ممکن است لینک‌ها و QRهای قبلی و مسیر تصاویر شعبه
                  را نامعتبر کند. تصاویر به پوشه جدید منتقل نمی‌شوند.
                </p>
              )}
              <div className="grid gap-5 sm:grid-cols-3">
                {languages.map((lang) => (
                  <div key={lang.code} className="space-y-4">
                    <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {lang.label}
                    </h3>
                    <Field
                      label="نام شعبه"
                      value={branchDraft[`name_${lang.code}`]}
                      onChange={(v) => updateBranch(`name_${lang.code}`, v)}
                      required={lang.code === "fa"}
                      ltr={lang.code === "en"}
                    />
                    <Field
                      label="آدرس"
                      value={branchDraft[`address_${lang.code}`]}
                      onChange={(v) => updateBranch(`address_${lang.code}`, v)}
                      multiline
                      ltr={lang.code === "en"}
                    />
                  </div>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["phone_1", "شماره تماس اول"],
                    ["phone_2", "شماره تماس دوم"],
                    ["latitude", "عرض جغرافیایی (latitude)"],
                    ["longitude", "طول جغرافیایی (longitude)"],
                    ["open", "ساعت باز شدن"],
                    ["close", "ساعت بسته شدن"],
                  ] as const
                ).map(([key, label]) => (
                  <Field
                    key={key}
                    label={label}
                    value={branchDraft[key]}
                    onChange={(v) => updateBranch(key, v)}
                    ltr
                  />
                ))}
              </div>
              <p className="text-xs leading-6 text-slate-500">
                ساعت‌ها با ارقام انگلیسی: 8 یا 08:00. برای ۱۱ شب، 23 وارد کنید.
                مقادیر قبلی بدون تبدیل خودکار حفظ می‌شوند. وضعیت «باز» مستقل از
                ساعت کاری و به‌صورت دستی تنظیم می‌شود.
              </p>
              <div className="flex flex-wrap gap-6">
                {(
                  [
                    ["is_active", "شعبه فعال است"],
                    ["is_open", "شعبه باز است"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-emerald-600"
                      checked={branchDraft[key]}
                      onChange={(e) => updateBranch(key, e.target.checked)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                برای توقف فعالیت شعبه، آن را غیرفعال کنید؛ سوابق شعبه حفظ
                می‌شوند.
              </p>
              {branchSaveError && <ErrorBox message={branchSaveError} />}
              <div className="flex gap-3">
                <Button type="submit" className={primary}>
                  <Save size={16} />
                  {savingBranch ? "در حال ذخیره…" : "ذخیره شعبه"}
                </Button>
                <Button type="button" variant="outline" onClick={closeBranch}>
                  انصراف
                </Button>
              </div>
              {editingBranch && (
                <p className="break-all text-xs text-slate-500">
                  شناسه رکورد: {editingBranch.id} · ثبت:{" "}
                  {new Date(editingBranch.created_at).toLocaleDateString(
                    "fa-IR",
                  )}
                </p>
              )}
            </fieldset>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
