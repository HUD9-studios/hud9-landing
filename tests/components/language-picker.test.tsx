// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LanguagePicker } from '@/features/landing/LanguagePicker';
import { useHeaderSection } from '@/features/landing/StickyHeader';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

vi.mock('@/features/landing/StickyHeader', () => ({
  useHeaderSection: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onNavigate,
  }: {
    children: ReactNode;
    href: string;
    onNavigate: () => void;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onNavigate();
      }}
    >
      {children}
    </a>
  ),
}));

const requestFrame = vi.fn<(callback: FrameRequestCallback) => number>(() => 1);

beforeEach(() => {
  requestFrame.mockClear();
  vi.stubGlobal('requestAnimationFrame', requestFrame);
  window.history.replaceState(null, '', '/es');
});

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
  vi.unstubAllGlobals();
});

function page(locale: Locale) {
  const copy = getDictionary(locale).landing.header;
  return (
    <>
      <LanguagePicker
        label={copy.language}
        names={copy.languageNames}
        locale={locale}
      />
      <section aria-label="Studio" id="studio" tabIndex={-1} />
      <section aria-label="Contact" id="contact" tabIndex={-1} />
    </>
  );
}

it.each(['studio', 'contact'] as const)(
  'restores the translated %s anchor and focus after layout',
  (section) => {
    vi.mocked(useHeaderSection).mockReturnValue(section);
    const { rerender } = render(page('es'));
    fireEvent.click(screen.getByLabelText('Idioma · Español'));
    fireEvent.click(screen.getByRole('link', { name: 'EN Inglés' }));

    window.history.replaceState(null, '', `/en#${section}`);
    rerender(page('en'));
    const target = document.getElementById(section)!;
    const scroll = vi.fn();
    target.scrollIntoView = scroll;
    expect(scroll).not.toHaveBeenCalled();

    const callback = requestFrame.mock.lastCall?.[0];
    expect(callback).toBeTypeOf('function');
    act(() => callback?.(0));
    expect(scroll).toHaveBeenCalledExactlyOnceWith({
      block: 'start',
      behavior: 'instant',
    });
    expect(document.activeElement).toBe(target);
  },
);

it('leaves scroll and focus alone when the destination fragment has changed', () => {
  vi.mocked(useHeaderSection).mockReturnValue('contact');
  const { rerender } = render(page('es'));
  fireEvent.click(screen.getByLabelText('Idioma · Español'));
  fireEvent.click(screen.getByRole('link', { name: 'EN Inglés' }));

  window.history.replaceState(null, '', '/en#studio');
  rerender(page('en'));
  const contact = screen.getByRole('region', { name: 'Contact' });
  const studio = screen.getByRole('region', { name: 'Studio' });
  contact.scrollIntoView = vi.fn();
  studio.focus();

  const callback = requestFrame.mock.lastCall?.[0];
  expect(callback).toBeTypeOf('function');
  act(() => callback?.(0));
  expect(contact.scrollIntoView).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(studio);
});
