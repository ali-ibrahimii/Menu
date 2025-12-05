// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // مسیرهای عمومی (بدون نیاز به لاگین)
  const publicPaths = ['/login', '/api'];
  
  // اگر مسیر عمومی است، بگذر
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // اگر مسیر ادمین است و کاربر لاگین نکرده
  if (pathname.startsWith('/admin')) {
    const cookies = request.headers.get('cookie') || '';
    const hasAuthCookie = cookies.includes('admin_auth=true');
    
    if (!hasAuthCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};