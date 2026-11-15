// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { LandingPage } from '@/features/landing/LandingPage';
import { getDictionary } from '@/i18n/dictionaries';

afterEach(cleanup);

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
