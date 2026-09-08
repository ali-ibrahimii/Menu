"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  User,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";

const theme = {
  page: "min-h-screen w-full bg-[#fff8ed] text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-500",
  card: "rounded-[2rem] border border-black/[0.08] bg-white/90 shadow-2xl shadow-black/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/30",
  input:
    "h-[52px] w-full rounded-2xl border border-black/10 bg-white pr-11 pl-11 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/30 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-all",
  label: "text-[13px] font-bold text-slate-700 dark:text-slate-200",
  button:
    "h-[52px] w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white font-black text-[15px] shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "5515896",
  };

  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
      if (isLoggedIn === "true") router.push("/admin");
    } catch {}
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (
        username === ADMIN_CREDENTIALS.username &&
        password === ADMIN_CREDENTIALS.password
      ) {
        localStorage.setItem("isAdminLoggedIn", "true");
        localStorage.setItem("adminUsername", username);
        document.cookie = "admin_auth=true; path=/; max-age=86400";
        const from = searchParams.get("from") || "/admin";
        router.push(from);
      } else {
        setError("نام کاربری یا رمز عبور اشتباه است");
      }
    } catch {
      setError("خطا در ورود به سیستم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${theme.page} flex items-center justify-center p-4 sm:p-6`}
      dir="rtl"
    >
      {/* بک‌گراند دکور */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.12),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.10),transparent_40%)]" />
        <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-300/20 blur-[80px] dark:bg-emerald-500/10" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-amber-300/20 blur-[80px] dark:bg-teal-500/10" />
      </div>

      <div className="w-full max-w-[420px]">
        {/* هدر */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white shadow-xl shadow-black/10 border border-black/5 dark:bg-slate-900 dark:border-white/10 dark:shadow-black/30">
            <Image
              src="/logo1.png"
              alt="logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/15 dark:border-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-3">
            <ShieldCheck size={12} />
            پنل امن مدیریت
          </div>
          <h1 className="text-[26px] font-black tracking-tight leading-8">
            پنل مدیریت منو رستوران
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            خوش آمدید - لطفا وارد شوید
          </p>
        </div>

        {/* کارت */}
        <div className={`${theme.card} p-6 sm:p-8`}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 dark:bg-red-500/10 p-3.5 text-red-700 dark:text-red-300">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span className="text-[13px] font-medium leading-5">
                  {error}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <label className={theme.label}>نام کاربری</label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className={theme.input}
                  required
                  dir="ltr"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={theme.label}>رمز عبور</label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={theme.input}
                  required
                  dir="ltr"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                پیش‌فرض: admin / 5515896
              </p>
            </div>

            <button type="submit" disabled={loading} className={theme.button}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  در حال ورود...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles size={16} />
                  ورود به پنل
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            <span className="text-[11px] text-slate-400">
              امن و رمزگذاری شده
            </span>
            <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          </div>

          <p className="mt-4 text-center text-[11px] leading-5 text-slate-500 dark:text-slate-400">
            دسترسی فقط برای مدیران مجاز است. تمام ورودها ثبت می‌شود.
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} Vatandar Restaurant
        </p>
      </div>
    </div>
  );
}
