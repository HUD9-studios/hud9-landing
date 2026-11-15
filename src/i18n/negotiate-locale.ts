import { defaultLocale, isLocale, type Locale } from './config';

const languagePreference =
  /^(\*|[a-z]{1,8}(?:-[a-z\d]{1,8})*)(?:\s*;\s*q=(0(?:\.\d{0,3})?|1(?:\.0{0,3})?))?$/i;

function parsePreference(value: string) {
  const match = languagePreference.exec(value.trim());
  if (!match) return undefined;

  const [, range, weight = '1'] = match;
  const locale = range.toLowerCase().split('-', 1)[0];
  const quality = Number(weight);

  if (!isLocale(locale) || quality === 0) return undefined;
  return { locale, quality };
}

export function negotiateLocale(acceptLanguage: string | null): Locale {
  const preferences = (acceptLanguage ?? '')
    .split(',')
    .map(parsePreference)
    .filter((preference) => preference !== undefined)
    .sort((first, second) => second.quality - first.quality);

  return preferences[0]?.locale ?? defaultLocale;
}
