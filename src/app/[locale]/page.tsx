import type { Metadata } from 'next';
import { LandingPage } from '@/features/landing/LandingPage';
import { getDictionary } from '@/i18n/dictionaries';
import { getRouteLocale } from './locale';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]'>): Promise<Metadata> {
  const locale = await getRouteLocale(params);
  return getDictionary(locale).metadata;
}

export default async function LocalePage({ params }: PageProps<'/[locale]'>) {
  const locale = await getRouteLocale(params);
  return <LandingPage copy={getDictionary(locale).landing} />;
}
