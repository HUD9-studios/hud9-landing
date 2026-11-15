import localFont from 'next/font/local';
import { locales } from '@/i18n/config';
import '@/styles/globals.scss';
import { getRouteLocale } from './locale';

const inter = localFont({
  src: '../../styles/fonts/inter-400.woff2',
  weight: '400',
  variable: '--font-inter',
  display: 'swap',
});

const rajdhani = localFont({
  src: [
    { path: '../../styles/fonts/rajdhani-600.woff2', weight: '600' },
    { path: '../../styles/fonts/rajdhani-700.woff2', weight: '700' },
  ],
  variable: '--font-rajdhani',
  display: 'swap',
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const locale = await getRouteLocale(params);

  return (
    <html lang={locale} className={`${inter.variable} ${rajdhani.variable}`}>
      <body>{children}</body>
    </html>
  );
}
