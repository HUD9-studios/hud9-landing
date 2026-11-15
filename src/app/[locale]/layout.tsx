import { locales } from '@/i18n/config';
import '@/styles/globals.scss';
import { getRouteLocale } from './locale';

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
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
