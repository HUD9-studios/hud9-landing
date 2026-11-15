import { describe, expect, it } from 'vitest';
import { locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

function messages(tree: object, prefix = ''): [string, string][] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix + key;
    return typeof value === 'string'
      ? [[path, value]]
      : messages(value, path + '.');
  });
}

describe('landing dictionaries', () => {
  const reference = getDictionary('en');

  it.each(locales)(
    'provides every landing and metadata string for %s',
    (locale) => {
      const entries = messages(getDictionary(locale));
      expect(entries.map(([path]) => path).sort()).toEqual(
        messages(reference)
          .map(([path]) => path)
          .sort(),
      );
      for (const [, value] of entries) {
        expect(value.trim()).not.toBe('');
      }
    },
  );

  it('localizes calls to action, descriptions and metadata', () => {
    const spanish = getDictionary('es');
    expect(spanish.landing.hero.action).not.toBe(reference.landing.hero.action);
    expect(spanish.landing.hero.description).not.toBe(
      reference.landing.hero.description,
    );
    expect(spanish.metadata.title).not.toBe(reference.metadata.title);
    expect(spanish.metadata.description).not.toBe(
      reference.metadata.description,
    );
  });
});
