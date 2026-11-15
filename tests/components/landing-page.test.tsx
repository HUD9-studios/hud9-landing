// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LandingPage } from '@/features/landing/LandingPage';
import { getDictionary } from '@/i18n/dictionaries';

afterEach(cleanup);

describe('LandingPage', () => {
  it.each([
    ['en', 'Game development and immersive technology.'],
    ['es', 'Desarrollo de videojuegos y tecnología inmersiva.'],
  ] as const)(
    'renders the %s copy within the shared main landmark',
    (locale, description) => {
      render(<LandingPage copy={getDictionary(locale).landing} />);

      const main = within(screen.getByRole('main'));
      expect(
        main.getByRole('heading', { level: 1, name: 'HUD9 Studios' }),
      ).toBeTruthy();
      expect(main.getByText(description)).toBeTruthy();
    },
  );
});
