import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Legacy redirects moved to _redirects if needed

  return NextResponse.next();
}

export const config = {
  matcher: [],
};
