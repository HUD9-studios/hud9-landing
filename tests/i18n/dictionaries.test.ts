import { describe, expect, it } from 'vitest';
import { locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

describe('landing dictionaries', () => {
  const reference = getDictionary('en');

  it.each(locales)(
    'provides every landing and metadata string for %s',
    (locale) => {
      const dictionary = getDictionary(locale);

      expect(Object.keys(dictionary.metadata).sort()).toEqual(
        Object.keys(reference.metadata).sort(),
      );
      expect(Object.keys(dictionary.landing).sort()).toEqual(
        Object.keys(reference.landing).sort(),
      );
      for (const message of [
        ...Object.values(dictionary.metadata),
        ...Object.values(dictionary.landing),
      ]) {
        expect(message.trim()).not.toBe('');
      }
    },
  );

  it('uses the same studio name with localized descriptions and metadata', () => {
    const spanish = getDictionary('es');

    expect(spanish.landing.heading).toBe(reference.landing.heading);
    expect(spanish.landing.description).not.toBe(reference.landing.description);
    expect(spanish.metadata.title).not.toBe(reference.metadata.title);
    expect(spanish.metadata.description).not.toBe(
      reference.metadata.description,
    );
  });
});
