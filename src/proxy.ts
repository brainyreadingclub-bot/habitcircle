import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Must match the key in auth.ts
const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'habitcircle-default-secret-change-me-in-env'
);

const publicPaths = ['/', '/login', '/signup'];
const publicApiPaths = ['/api/auth/login', '/api/auth/signup'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.includes(pathname) || publicApiPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET_KEY);
    return NextResponse.next();
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
