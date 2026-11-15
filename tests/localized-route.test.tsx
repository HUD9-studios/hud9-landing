import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import LocaleLayout, { generateStaticParams } from '@/app/[locale]/layout';
import LocalePage, { generateMetadata } from '@/app/[locale]/page';

describe('localized routes', () => {
  it('prerenders only the supported App Router segments', () => {
    expect(generateStaticParams()).toEqual([
      { locale: 'en' },
      { locale: 'es' },
    ]);
  });

  it.each([
    {
      locale: 'en',
      title: 'HUD9 Studios | Games and immersive technology',
      description:
        'HUD9 Studios develops games and immersive interactive experiences.',
    },
    {
      locale: 'es',
      title: 'HUD9 Studios | Videojuegos y tecnología inmersiva',
      description:
        'HUD9 Studios desarrolla videojuegos y experiencias interactivas inmersivas.',
    },
  ])(
    'sets the document language and metadata for $locale',
    async ({ locale, title, description }) => {
      const params = Promise.resolve({ locale });
      const props = { params, searchParams: Promise.resolve({}) };
      const page = await LocalePage(props);
      const document = await LocaleLayout({ children: page, params });

      expect(renderToStaticMarkup(document)).toContain(
        `<html lang="${locale}">`,
      );
      await expect(generateMetadata(props)).resolves.toEqual({
        title,
        description,
      });
    },
  );

  it('rejects a segment with no supported dictionary', async () => {
    await expect(
      LocalePage({
        params: Promise.resolve({ locale: 'fr' }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
  });
});
