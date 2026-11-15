import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/config';

export async function getRouteLocale(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
