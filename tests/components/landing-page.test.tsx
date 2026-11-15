// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LandingPage } from '@/features/landing/LandingPage';
import { getDictionary } from '@/i18n/dictionaries';

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it.each([
  ['en', 'We make video games. We explore new experiences.', 'Meet the studio'],
  [
    'es',
    'Creamos videojuegos. Exploramos nuevas experiencias.',
    'Conoce el estudio',
  ],
] as const)(
  'renders the localized %s hero and links to the studio',
  (locale, title, action) => {
    render(
      <LandingPage locale={locale} copy={getDictionary(locale).landing} />,
    );

    const main = within(screen.getByRole('main'));
    expect(main.getByRole('heading', { level: 1, name: title })).toBeTruthy();
    expect(main.getByRole('link', { name: action }).getAttribute('href')).toBe(
      '#studio',
    );
    expect(document.getElementById('studio')).toBeTruthy();
    expect(
      within(
        main.getByRole('region', {
          name: getDictionary(locale).landing.services.label,
        }),
      ).getAllByRole('listitem'),
    ).toHaveLength(4);
  },
);

it.each([
  ['es', 'en', 'Idioma · Español', 'EN Inglés'],
  ['en', 'es', 'Language · English', 'ES Spanish'],
] as const)(
  'opens the %s language selector and links to %s',
  (locale, target, trigger, option) => {
    render(
      <LandingPage locale={locale} copy={getDictionary(locale).landing} />,
    );

    const summary = screen.getByLabelText(trigger);
    fireEvent.click(summary);
    const picker = summary.closest('details');
    expect(picker?.open).toBe(true);
    expect(
      screen.getByRole('link', { name: option }).getAttribute('href'),
    ).toBe('/' + target);
    expect(
      picker?.querySelector('[aria-current="page"]')?.getAttribute('href'),
    ).toBe('/' + locale);
  },
);

it.each([
  [
    'es',
    'Distintas trayectorias. Una misma visión.',
    ['Experiencia', 'Creatividad', 'Tecnología'],
  ],
  [
    'en',
    'Different backgrounds. One shared vision.',
    ['Experience', 'Creativity', 'Technology'],
  ],
] as const)(
  'renders an accessible %s studio with the arcade before the copy',
  (locale, title, pillars) => {
    const copy = getDictionary(locale).landing;
    render(<LandingPage locale={locale} copy={copy} />);

    const region = screen.getByRole('region', { name: title });
    const studio = within(region);
    const arcade = region.querySelector('canvas');
    const heading = studio.getByRole('heading', { level: 2, name: title });

    expect(arcade?.getAttribute('aria-hidden')).toBe('true');
    expect(arcade?.compareDocumentPosition(heading)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(studio.getByText(copy.studio.label)).toBeTruthy();
    expect(studio.getByText(copy.studio.introduction)).toBeTruthy();
    expect(studio.getByText(copy.studio.approach)).toBeTruthy();
    expect(
      studio
        .getAllByRole('heading', { level: 3 })
        .map(({ textContent }) => textContent),
    ).toEqual(pillars);
  },
);

it('uses existing destinations and indicates unavailable contact and WhatsApp', () => {
  render(<LandingPage locale="es" copy={getDictionary('es').landing} />);

  const nav = within(
    screen.getByRole('navigation', { name: 'Navegación principal' }),
  );
  const links = nav
    .getAllByRole('link')
    .filter((link) => link.hasAttribute('href'));
  expect(links.map((link) => link.getAttribute('href'))).toEqual([
    '#home',
    '#studio',
  ]);
  for (const link of links) {
    expect(
      document.getElementById(link.getAttribute('href')?.slice(1) ?? ''),
    ).toBeTruthy();
  }
  expect(
    nav
      .getByRole('link', { name: 'Contacto aún no disponible' })
      .getAttribute('aria-disabled'),
  ).toBe('true');
  expect(
    nav
      .getByRole('button', { name: 'WhatsApp aún no disponible' })
      .hasAttribute('disabled'),
  ).toBe(true);
});

it('compacts the sticky header on scroll and restores it at the top', () => {
  vi.stubGlobal('scrollY', 0);
  render(<LandingPage locale="es" copy={getDictionary('es').landing} />);
  const header = screen.getByRole('banner');
  expect(header.hasAttribute('data-compact')).toBe(false);

  vi.stubGlobal('scrollY', 60);
  fireEvent.scroll(window);
  expect(header.hasAttribute('data-compact')).toBe(true);

  vi.stubGlobal('scrollY', 0);
  fireEvent.scroll(window);
  expect(header.hasAttribute('data-compact')).toBe(false);
});

it('updates the current menu location in both scroll directions', () => {
  const frame = vi.fn<(callback: FrameRequestCallback) => number>(() => 1);
  vi.stubGlobal('requestAnimationFrame', frame);
  vi.stubGlobal('innerHeight', 800);
  vi.stubGlobal('scrollY', 0);
  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(
    1800,
  );
  const rect = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      return this.id === 'studio'
        ? new DOMRect(0, 900, 1280, 900)
        : new DOMRect(0, 0, 1280, 80);
    });
  const copy = getDictionary('es').landing;
  render(<LandingPage locale="es" copy={copy} />);
  const nav = screen.getByRole('navigation', { name: copy.header.navigation });
  const home = within(nav).getByRole('link', { name: copy.header.home });
  const studio = within(nav).getByRole('link', { name: copy.header.studio });

  expect(home.getAttribute('aria-current')).toBe('location');
  expect(studio.hasAttribute('aria-current')).toBe(false);

  function scrollTo(top: number, scrollY: number) {
    vi.stubGlobal('scrollY', scrollY);
    rect.mockImplementation(function (this: HTMLElement) {
      return this.id === 'studio'
        ? new DOMRect(0, top, 1280, 800 - top)
        : new DOMRect(0, 0, 1280, 80);
    });
    fireEvent.scroll(window);
    act(() => frame.mock.lastCall?.[0](0));
  }

  scrollTo(90, 810);
  expect(studio.getAttribute('aria-current')).toBe('location');
  expect(home.hasAttribute('aria-current')).toBe(false);

  scrollTo(150, 750);
  expect(home.getAttribute('aria-current')).toBe('location');
  expect(studio.hasAttribute('aria-current')).toBe(false);

  scrollTo(150, 1000);
  expect(studio.getAttribute('aria-current')).toBe('location');
});

it.each(['es', 'en'] as const)(
  'closes the %s compact navigation with Escape and restores focus',
  (locale) => {
    const copy = getDictionary(locale).landing;
    render(<LandingPage locale={locale} copy={copy} />);

    const toggle = screen.getByRole('button', { name: copy.header.menu });
    const nav = screen.getByRole('navigation', {
      name: copy.header.navigation,
    });
    expect(toggle.getAttribute('aria-controls')).toBe(nav.id);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const studio = within(nav).getByRole('link', {
      name: copy.header.studio,
    });
    studio.focus();
    fireEvent.keyDown(studio, { key: 'Escape' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);

    fireEvent.click(toggle);
    fireEvent.blur(toggle, { relatedTarget: studio });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    fireEvent.blur(studio, {
      relatedTarget: screen.getByRole('main'),
    });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(toggle);
    fireEvent.click(studio);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement?.id).toBe('studio');
  },
);

it('opens experiment information and explains that the minigame is unavailable', () => {
  render(<LandingPage locale="es" copy={getDictionary('es').landing} />);

  const experiment = within(
    screen.getByRole('article', { name: 'Core Protocol 09' }),
  );
  const action = experiment.getByText('Sobre el experimento');
  const disclosure = action.closest('details');
  expect(disclosure?.open).toBe(false);
  fireEvent.click(action);
  expect(disclosure?.open).toBe(true);
  expect(
    experiment.getByText(/El minijuego aún no está disponible/),
  ).toBeTruthy();
});
