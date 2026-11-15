import { NextResponse, type NextRequest } from 'next/server';
import { negotiateLocale } from '@/i18n/negotiate-locale';

export function proxy(request: NextRequest) {
  const locale = negotiateLocale(request.headers.get('accept-language'));
  const destination = request.nextUrl.clone();
  destination.pathname = `/${locale}`;

  const response = NextResponse.redirect(destination);
  response.headers.set('Vary', 'Accept-Language');
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = { matcher: '/' };
