// components/admin/AdminSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Utensils,
  PlusCircle,
  ShoppingCart,
  Menu as MenuIcon,
  Users,
  Settings,
  BarChart3,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Package,
  CreditCard,
  Bell,
  HelpCircle,
  User
} from 'lucide-react';

interface AdminSidebarProps {
  onLogout: () => void;
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const username = typeof window !== 'undefined' 
    ? localStorage.getItem('admin_username') || 'ادمین' 
    : 'ادمین';

  const mainMenuItems = [
    {
      href: '/admin',
      label: 'داشبورد',
      icon: Home,
      active: pathname === '/admin',
    },
    {
      href: '/admin/orders',
      label: 'سفارشات',
      icon: ShoppingCart,
      count: 12,
      active: pathname?.startsWith('/admin/orders'),
    },
    {
      href: '/menu',
      label: 'منو',
      icon: MenuIcon,
      active: pathname?.startsWith('/menu'),
    },
    {
      href: '/admin/users',
      label: 'کاربران',
      icon: Users,
      active: pathname?.startsWith('/admin/users'),
    },
    {
      href: '/admin/foods',
      label: 'مدیریت غذاها',
      icon: Utensils,
      submenu: [
        { href: '/admin/foods', label: 'لیست غذاها' },
        { href: '/admin/add-food', label: 'افزودن غذا' },
        { href: '/admin/categories', label: 'دسته‌بندی‌ها' },
      ],
      active: pathname?.startsWith('/admin/foods') || 
      pathname?.startsWith('/admin/add-food') ||
      pathname?.startsWith('/admin/categories'),
    },
    {
      href: '/admin/analytics',
      label: 'آمار و گزارشات',
      icon: BarChart3,
      active: pathname?.startsWith('/admin/analytics'),
    },
  ];

  const secondaryMenuItems = [
    {
      href: '/admin/notifications',
      label: 'اعلانات',
      icon: Bell,
      count: 3,
    },
    {
      href: '/admin/settings',
      label: 'تنظیمات',
      icon: Settings,
    },
    {
      href: '/admin/help',
      label: 'راهنما',
      icon: HelpCircle,
    },
  ];

  const toggleSubmenu = (label: string) => {
    setActiveSubmenu(activeSubmenu === label ? null : label);
  };

  return (
    <div className={`h-screen flex flex-col transition-all duration-300 border bg-gray-300 ${collapsed ? 'w-20' : 'w-64'}`}>

      {/* هدر سایدبار */}
      <div className={`flex items-center justify-between ${collapsed ? 'justify-center' : ''} p-4 border-b`}>
        {/* اطلاعات کاربر */}
        {!collapsed && (
          <div className="">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">
                    <User />
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{username}</h3>
                <p className="text-xs text-gray-500">مدیر سیستم</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 bg-accent rounded-lg transition"
        >
          {collapsed ? (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>


      {/* منوی اصلی */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1 px-3">
          <p className={`text-[11px] font-medium text-gray-500 uppercase mb-2 ${collapsed ? 'hidden' : 'px-3'}`}>
            منوی اصلی
          </p>
          
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu;
            
            return (
              <div key={item.label}>
                {hasSubmenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className={`w-full flex items-center ${collapsed ? 'hidden' : ''} text-[12px] font-semibold justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                        item.active
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Icon size={18} className={`${item.active ? 'text-blue-500' : 'text-gray-500'}`} />
                        {!collapsed && <span>{item.label}</span>}
                      </div>
                      
                      {!collapsed && (
                        <ChevronRight 
                          className={`w-4 h-4 transition-transform ${
                            activeSubmenu === item.label ? 'rotate-90' : ''
                          }`}
                        />
                      )}
                    </button>

                    {/* زیرمنو */}
                    {!collapsed && activeSubmenu === item.label && (
                      <div className="mr-10">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center text-[11px] font-semibold gap-2 px-3 py-2 rounded-lg text-sm transition ${
                              pathname === subItem.href
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 rounded-lg hover:text-gray-900'
                            }`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                            <span>{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 py-2 px-3 rounded-lg text-[12px] font-semibold transition-all duration-200 group ${
                      item.active
                        ? 'bg-blue-50 justify-center text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 justify-center hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} className={`${item.active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                    
                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between">
                        <span>{item.label}</span>
                        {item.count !== undefined && (
                          <span className="bg-blue-100 text-blue-600 text-[12px] font-medium px-2 py-1 rounded-full">
                            {item.count}
                          </span>
                        )}
                      </div>
                    )}

                    {collapsed && item.count !== undefined && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {item.count}
                      </div>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* منوی ثانویه */}
        <div className={`mt-8 px-3 ${collapsed ? 'hidden' : ''}`}>
          <p className={`text-[11px] font-medium text-gray-500 uppercase mb-2 ${collapsed ? 'hidden' : 'px-3'}`}>
            سایر
          </p>
          
          {secondaryMenuItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 p-3 rounded-lg text-[12px] font-semibold transition-all duration-200 group ${
                  pathname === item.href
                    ? 'bg-gray-50 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} className=" text-gray-500 group-hover:text-gray-700" />
                
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.count !== undefined && (
                      <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </div>
                )}

                {collapsed && item.count !== undefined && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {item.count}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* فوتر سایدبار */}
      <div className="border-t p-4">
        <button
          onClick={onLogout}
          className={`flex items-center gap-3 p-3 border justify-center bg-blue-600 rounded-lg w-full text-white hover:bg-blue-500 transition ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={18} />
          {!collapsed && <span>خروج از سیستم</span>}
        </button>

        {!collapsed && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>ورژن 1.0.0</span>
              <span>© 2024</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}