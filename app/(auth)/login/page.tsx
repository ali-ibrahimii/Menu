// app/admin/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, LogIn, AlertCircle, Users } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // اطلاعات ثابت ادمین
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  };

  // چک کن اگر قبلاً لاگین کرده
  useEffect(() => {
    const checkAuth = () => {
      try {
        const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
        if (isLoggedIn === 'true') {
          router.push('/admin');
        }
      } catch (err) {
        console.log('LocalStorage not available yet');
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // اعتبارسنجی ساده
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // ذخیره در localStorage
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminUsername', username);
        
        // تنظیم کوکی برای middleware
        document.cookie = 'admin_auth=true; path=/; max-age=86400'; // 24 ساعت
        
        // ریدایرکت به صفحه ادمین
        const from = searchParams.get('from') || '/admin';
        router.push(from);
      } else {
        setError('نام کاربری یا رمز عبور اشتباه است');
      }
    } catch (err) {
      setError('خطا در ورود به سیستم');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* کارت فرم */}
        <div className="bg-white rounded-4xl shadow-xl p-8">
        {/* هدر */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-blue-600 rounded-full p-5 mb-6">
            <Users size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            پنل مدیریت رستوران
          </h1>
          <p className="text-gray-600">
            لطفاً برای ادامه وارد شوید
          </p>
        </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* پیغام خطا */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* فیلد نام کاربری */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                نام کاربری
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری خود را وارد کنید"
                  className="w-full pr-10 pl-4 py-4 border border-gray-300 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition text-right"
                  required
                  dir="rtl"
                />
              </div>
            </div>

            {/* فیلد رمز عبور */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                رمز عبور
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور خود را وارد کنید"
                  className="w-full pr-10 pl-4 py-4 border border-gray-300 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition text-right"
                  required
                  dir="rtl"
                />
              </div>
            </div>

            {/* دکمه ورود */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-400  text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>در حال ورود...</span>
                </>
              ) : (
                <>
                  <span>ورود</span>
                </>
              )}
            </button>
          </form>

          {/* فوتر */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              دسترسی به این صفحه فقط برای مدیران سیستم مجاز می‌باشد
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}