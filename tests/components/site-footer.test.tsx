// @vitest-environment jsdom
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { FooterYear } from '@/features/landing/footer/FooterYear';
import { LandingPage } from '@/features/landing/LandingPage';
import { getDictionary } from '@/i18n/dictionaries';

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  vi.stubEnv('HUD9_INSTAGRAM_URL', undefined);
  vi.stubEnv('HUD9_FACEBOOK_URL', undefined);
  vi.stubEnv('HUD9_WHATSAPP_NUMBER', undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

it.each([
  ['es', 'Explora', ['Inicio', 'El estudio', 'Contacto']],
  ['en', 'Explore', ['Home', 'The Studio', 'Contact']],
] as const)(
  'renders a localized footer with same-page destinations in %s',
  (locale, explore, names) => {
    vi.setSystemTime(new Date(2035, 0, 15));
    const copy = getDictionary(locale).landing;
    render(<LandingPage copy={copy} locale={locale} />);
    const landmark = screen.getByRole('contentinfo');
    const footer = within(landmark);
    expect(screen.getByRole('main').contains(landmark)).toBe(false);
    expect(
      document.getElementById('contact')?.compareDocumentPosition(landmark),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(
      footer.getByRole('img', { name: 'HUD9 Studios' }).getAttribute('src'),
    ).toBe('/images/brand/logo/hud9-logo-white.webp');
    expect(footer.getByText(copy.footer.tagline)).toBeTruthy();
    expect(footer.getByText(copy.footer.socialNote)).toBeTruthy();
    expect(footer.getByText(copy.footer.signOff)).toBeTruthy();
    expect(
      footer.getByText('© 2035 HUD9 Studios. ' + copy.footer.rights),
    ).toBeTruthy();

    const navigation = within(
      footer.getByRole('navigation', { name: explore }),
    );
    for (const [index, id] of ['home', 'studio', 'contact'].entries()) {
      const link = navigation.getByRole('link', { name: names[index] });
      const href = link.getAttribute('href') ?? '';
      expect(href).toBe('#' + id);
      expect(
        new URL(href, new URL('/' + locale, location.origin)).pathname,
      ).toBe('/' + locale);
      expect(document.getElementById(id)).toBeTruthy();
    }
  },
);

it('refreshes the copyright year in the browser after a year change', async () => {
  vi.setSystemTime(new Date(2040, 0, 15));
  render(
    <p>
      © <FooterYear initialYear={2039} />
    </p>,
  );
  await waitFor(() => expect(screen.getByText('© 2040')).toBeTruthy());
});

it('shares configured WhatsApp and secures all external social links', () => {
  vi.stubEnv('HUD9_INSTAGRAM_URL', 'https://www.instagram.com/test-profile/');
  vi.stubEnv('HUD9_FACEBOOK_URL', 'https://facebook.com/test-profile');
  vi.stubEnv('HUD9_WHATSAPP_NUMBER', '+12025550123');
  render(<LandingPage copy={getDictionary('en').landing} locale="en" />);

  const footer = within(screen.getByRole('contentinfo'));
  for (const [name, url] of [
    ['Instagram', 'https://www.instagram.com/test-profile/'],
    ['Facebook', 'https://facebook.com/test-profile'],
    ['WhatsApp', 'https://wa.me/12025550123'],
  ]) {
    const link = footer.getByRole('link', { name });
    expect(link.getAttribute('href')).toBe(url);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')?.split(' ')).toEqual([
      'noopener',
      'noreferrer',
    ]);
  }
  const header = within(screen.getByRole('banner'));
  expect(
    header.getByRole('link', { name: 'WhatsApp' }).getAttribute('href'),
  ).toBe(footer.getByRole('link', { name: 'WhatsApp' }).getAttribute('href'));
});

it('keeps unavailable channels visible and out of keyboard navigation', () => {
  render(<LandingPage copy={getDictionary('es').landing} locale="es" />);
  const socials = within(screen.getByRole('region', { name: 'Conecta' }));
  for (const name of ['Instagram', 'Facebook', 'WhatsApp']) {
    const button = socials.getByRole<HTMLButtonElement>('button', {
      name: name + ' · No disponible',
    });
    expect(button.disabled).toBe(true);
  }
  expect(socials.queryByRole('link')).toBeNull();
  expect(socials.getAllByRole('button')).toHaveLength(3);
});

it.each([
  'javascript:void(0)',
  'http://instagram.com/test-profile',
  'https://instagram.com.evil.example/test-profile',
  'https://other@instagram.com/test-profile',
  'https://instagram.com:8080/test-profile',
  'https://instagram.com/',
])('rejects an invalid social configuration %s', (url) => {
  vi.stubEnv('HUD9_INSTAGRAM_URL', url);
  render(<LandingPage copy={getDictionary('en').landing} locale="en" />);
  const socials = within(screen.getByRole('region', { name: 'Connect' }));
  expect(socials.queryByRole('link', { name: 'Instagram' })).toBeNull();
  expect(
    socials.getByRole<HTMLButtonElement>('button', {
      name: 'Instagram · Unavailable',
    }).disabled,
  ).toBe(true);
});
