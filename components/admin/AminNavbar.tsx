// components/admin/AdminNavbar.tsx
'use client';

import { useAdminAuth } from '@/contexts/AdminAuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Utensils, 
  ShoppingCart, 
  Menu as MenuIcon,
  LogOut,
  PlusCircle,
  Settings
} from 'lucide-react';

export default function AdminNavbar() {
  const { logout } = useAdminAuth();
  const pathname = usePathname();
  const username = localStorage.getItem('admin_username') || 'ادمین';

  const navItems = [
    { href: '/admin', label: 'داشبورد', icon: Home },
    { href: '/admin/add-food', label: 'افزودن غذا', icon: PlusCircle },
    { href: '/admin/foods', label: 'غذاها', icon: Utensils },
    { href: '/admin/orders', label: 'سفارشات', icon: ShoppingCart },
    { href: '/admin/menu', label: 'منو', icon: MenuIcon },
  ];

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* سمت راست: لوگو */}
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <span className="mr-3 text-xl font-bold text-gray-900">پنل مدیریت</span>
            </Link>
          </div>

          {/* وسط: منو */}
          <div className="hidden md:flex items-center space-x-1 space-x-reverse">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 ml-1" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* سمت چپ: اطلاعات کاربر */}
          <div className="flex items-center">
            <div className="mr-4 text-sm text-gray-700 hidden md:block">
              <div className="font-medium">{username}</div>
              <div className="text-gray-500">مدیر سیستم</div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="h-4 w-4 ml-1" />
              خروج
            </button>
          </div>
        </div>
      </div>

      {/* منو موبایل */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around px-2 py-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center p-2 rounded-lg text-xs ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}