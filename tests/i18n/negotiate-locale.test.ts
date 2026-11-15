import { describe, expect, it } from 'vitest';
import { defaultLocale, isLocale, locales } from '@/i18n/config';
import { negotiateLocale } from '@/i18n/negotiate-locale';

describe('supported locales', () => {
  it('exposes English and Spanish as route segments and defaults to English', () => {
    expect(locales).toEqual(['en', 'es']);
    expect(defaultLocale).toBe('en');
  });

  it.each(locales)('accepts the %s route segment', (locale) => {
    expect(isLocale(locale)).toBe(true);
  });

  it.each(['fr', 'es-CO', 'EN'])('rejects %s as a route segment', (locale) => {
    expect(isLocale(locale)).toBe(false);
  });
});

describe('Accept-Language negotiation', () => {
  it.each([
    ['es-CO, en;q=0.8', 'es'],
    ['EN-GB;q=0.9, es;q=0.3', 'en'],
    ['fr-CA, es-419;q=0.8', 'es'],
    ['es;q=0.7, en;q=0.7', 'es'],
    ['en;q=0.7, es;q=0.7', 'en'],
    ['en, es;q=0', 'en'],
    ['es;q=invalid, es-MX;q=0.5', 'es'],
  ])('negotiates %s as %s', (header, locale) => {
    expect(negotiateLocale(header)).toBe(locale);
  });

  it.each([null, '', 'fr-CA, de;q=0.8', 'es;q=0', '*', 'es;q=1.5'])(
    'falls back to English for %s',
    (header) => {
      expect(negotiateLocale(header)).toBe('en');
    },
  );
});
