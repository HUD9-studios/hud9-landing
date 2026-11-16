// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ContactForm } from '@/features/landing/contact/ContactForm';
import { getDictionary } from '@/i18n/dictionaries';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

it.each([
  ['es', 'espana', 'España'],
  ['en', 'spain', 'Spain'],
] as const)(
  'searches for a localized country and calling code in %s',
  (locale, term, country) => {
    const copy = getDictionary(locale).landing.contact.form;
    render(<ContactForm copy={copy} locale={locale} />);
    const trigger = screen.getByRole('button', { name: /Colombia \+57/ });
    expect(trigger.querySelector('span')?.classList.contains('flag:CO')).toBe(
      true,
    );
    fireEvent.click(trigger);
    const search = screen.getByRole('combobox', { name: copy.phone.search });
    expect(document.activeElement).toBe(search);
    const list = screen.getByRole('listbox', { name: copy.phone.country });
    expect(search.getAttribute('aria-controls')).toBe(list.id);
    expect(list.tabIndex).toBe(-1);
    expect(within(list).getAllByRole('option')).toHaveLength(245);

    fireEvent.change(search, { target: { value: term } });
    const spain = within(list).getByRole('option', { name: `${country} +34` });
    expect(spain.querySelector('span')?.classList.contains('flag:ES')).toBe(
      true,
    );
    expect(search.getAttribute('aria-activedescendant')).toBe(spain.id);
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('button', { name: new RegExp(country) })).toBe(
      document.activeElement,
    );

    fireEvent.click(trigger);
    const reopened = screen.getByRole('combobox', { name: copy.phone.search });
    fireEvent.change(reopened, { target: { value: '+57' } });
    expect(
      within(screen.getByRole('listbox'))
        .getAllByRole('option')
        .map(({ textContent }) => textContent),
    ).toEqual(['Colombia+57']);
    fireEvent.change(reopened, { target: { value: 'no-country-here' } });
    expect(screen.getByRole('status').textContent).toBe(copy.phone.noResults);
    fireEvent.keyDown(reopened, { key: 'Escape' });
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  },
);

it('navigates countries with arrow keys and supports pointer selection', () => {
  const copy = getDictionary('en').landing.contact.form;
  render(<ContactForm copy={copy} locale="en" />);
  fireEvent.click(screen.getByRole('button', { name: /Colombia \+57/ }));
  const search = screen.getByRole('combobox', { name: copy.phone.search });
  fireEvent.change(search, { target: { value: '+1' } });
  const options = screen
    .getAllByRole('option')
    .filter((option) => option.id.startsWith('contact-phone-countries-'));
  fireEvent.keyDown(search, { key: 'ArrowDown' });
  expect(search.getAttribute('aria-activedescendant')).toBe(options[1].id);
  fireEvent.keyDown(search, { key: 'ArrowUp' });
  expect(search.getAttribute('aria-activedescendant')).toBe(options[0].id);
  fireEvent.click(screen.getByRole('option', { name: 'Canada +1' }));
  expect(screen.getByRole('button', { name: /Canada \+1/ })).toBe(
    document.activeElement,
  );
});

it('dismisses the country picker on outside interaction and preserves focus when tabbing away', () => {
  const copy = getDictionary('en').landing.contact.form;
  render(<ContactForm copy={copy} locale="en" />);
  const trigger = screen.getByRole('button', { name: /Colombia \+57/ });
  const number = screen.getByRole('textbox', { name: copy.phone.label });

  fireEvent.click(trigger);
  const search = screen.getByRole('combobox', { name: copy.phone.search });
  fireEvent.pointerDown(search);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  fireEvent.pointerDown(number);
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(screen.queryByRole('listbox')).toBeNull();

  fireEvent.click(trigger);
  act(() => number.focus());
  expect(document.activeElement).toBe(number);
  expect(screen.queryByRole('listbox')).toBeNull();
});

it('keeps the phone optional and preserves invalid input while showing a translated error', () => {
  const copy = getDictionary('es').landing.contact.form;
  render(<ContactForm copy={copy} locale="es" />);
  fireEvent.change(screen.getByRole('textbox', { name: copy.email.label }), {
    target: { value: 'studio@example.com' },
  });
  const phone = screen.getByRole<HTMLInputElement>('textbox', {
    name: copy.phone.label,
  });
  fireEvent.blur(phone);
  expect(phone.hasAttribute('required')).toBe(false);
  expect(phone.hasAttribute('aria-invalid')).toBe(false);

  fireEvent.change(phone, { target: { value: '+44 20' } });
  fireEvent.blur(phone);
  expect(phone.value).toBe('+44 20');
  expect(phone.getAttribute('aria-invalid')).toBe('true');
  expect(phone.getAttribute('aria-describedby')).toBe(
    screen.getByRole('alert').id,
  );
  expect(screen.getByRole('alert').textContent).toBe(copy.invalidPhone);

  fireEvent.change(phone, { target: { value: '0044 20 7946 0018' } });
  fireEvent.blur(phone);
  expect(phone.value).toBe('2079460018');
  expect(phone.hasAttribute('aria-invalid')).toBe(false);
  expect(screen.getByRole('button', { name: /Reino Unido \+44/ })).toBeTruthy();
});

it('splits an international paste and restores a saved legacy number', async () => {
  sessionStorage.setItem(
    'hud9-contact-draft',
    JSON.stringify({ phone: '+1 202-555-0123' }),
  );
  const copy = getDictionary('en').landing.contact.form;
  render(<ContactForm copy={copy} locale="en" />);
  const phone = screen.getByRole<HTMLInputElement>('textbox', {
    name: copy.phone.label,
  });
  await waitFor(() => expect(phone.value).toBe('2025550123'));
  expect(
    screen.getByRole('button', { name: /United States \+1/ }),
  ).toBeTruthy();
  phone.setSelectionRange(0, phone.value.length);
  fireEvent.paste(phone, {
    clipboardData: { getData: () => '+34 612 34 56 78' },
  });
  expect(phone.value).toBe('612345678');
  expect(screen.getByRole('button', { name: /Spain \+34/ })).toBeTruthy();
});
