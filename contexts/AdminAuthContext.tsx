// contexts/AdminAuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // چک کردن وضعیت لاگین هنگام لود صفحه
    const auth = localStorage.getItem('admin_authenticated') === 'true';
    setIsAuthenticated(auth);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // اعتبارسنجی ساده با مقادیر ثابت
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_username', username);
      setIsAuthenticated(true);
      
      // تنظیم cookie برای middleware
      document.cookie = 'admin_auth=true; path=/; max-age=86400'; // 24 ساعت
      
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_username');
    setIsAuthenticated(false);
    
    // حذف cookie
    document.cookie = 'admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // ریدایرکت به صفحه لاگین
    window.location.href = '/admin/login';
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}