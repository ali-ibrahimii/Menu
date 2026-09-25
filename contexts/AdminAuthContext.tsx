"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

/**
 * منبع واحد مدیریت ورود ادمین
 * ---------------------------------------------
 * قبل از این تغییر دو سیستم موازی وجود داشت (کلیدهای localStorage متفاوت
 * و رمزهای عبور متفاوت) که باعث می‌شد ورود در دفعات اول درست کار نکند.
 * حالا همه‌جا فقط از همین کانتکست استفاده می‌شود.
 */

// اطلاعات ورود ادمین (تک منبع)
export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "5515896",
};

const AUTH_KEY = "isAdminLoggedIn";
const USERNAME_KEY = "adminUsername";
const COOKIE_NAME = "admin_auth";

interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  /** ست کردن وضعیت ورود (برای ریدایرکت‌های سراسری) */
  setAuthenticated: (value: boolean) => void;
}

const AdminAuthContext = createContext<AdminAuthState | undefined>(undefined);

/** فقط مسیرهای داخلی سایت مجاز هستند */
function safeInternalPath(path: string | null | undefined, fallback = "/admin") {
  if (path && path.startsWith("/") && !path.startsWith("//")) return path;
  return fallback;
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");

  // چک کردن وضعیت لاگین هنگام لود صفحه (سمت کلاینت)
  useEffect(() => {
    try {
      // وضعیت معتبر = فلگ localStorage «و» کوکی با هم باشند.
      // اگر کوکی منقضی شده باشد ولی localStorage مانده باشد، ورود در
      // دفعات بعدی شکست می‌خورد؛ پس فلگ کهنه را پاک می‌کنیم.
      const hasCookie = document.cookie.includes(`${COOKIE_NAME}=true`);
      const auth = localStorage.getItem(AUTH_KEY) === "true" && hasCookie;
      if (!hasCookie) {
        localStorage.removeItem(AUTH_KEY);
      }
      // الگوی استاندارد خواندن client-only storage بعد از hydration
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(auth);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsername(localStorage.getItem(USERNAME_KEY) || "ادمین");
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(false);
    } finally {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
    }
  }, []);

  const setAuthenticated = useCallback((value: boolean) => {
    setIsAuthenticated(value);
  }, []);

  const login = useCallback(
    async (user: string, pass: string): Promise<boolean> => {
      if (
        user.trim() === ADMIN_CREDENTIALS.username &&
        pass === ADMIN_CREDENTIALS.password
      ) {
        try {
          localStorage.setItem(AUTH_KEY, "true");
          localStorage.setItem(USERNAME_KEY, ADMIN_CREDENTIALS.username);
          // کوکی برای گارد سمت سرور (proxy)
          document.cookie = `${COOKIE_NAME}=true; path=/; max-age=86400; samesite=lax`;
          setUsername(ADMIN_CREDENTIALS.username);
          setIsAuthenticated(true);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    },
    [],
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(USERNAME_KEY);
      localStorage.removeItem("admin_authenticated"); // کلید قدیمی سیستم قبلی
    } catch {}
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    setIsAuthenticated(false);
    // لود کامل صفحه تا کوکی حتماً در درخواست سرور هم اعمال شود
    window.location.assign("/login");
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        username,
        login,
        logout,
        setAuthenticated,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

export { safeInternalPath };
