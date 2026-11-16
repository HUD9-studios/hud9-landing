// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ContactSection } from '@/features/landing/contact/ContactSection';
import { getDictionary } from '@/i18n/dictionaries';

const unsetChannels = { email: undefined, whatsappHref: undefined };

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

it.each(['es', 'en'] as const)(
  'renders the contact form and channels in %s',
  (locale) => {
    const copy = getDictionary(locale).landing.contact;
    render(
      <ContactSection copy={copy} channels={unsetChannels} locale={locale} />,
    );
    const heading = [copy.titleStart, copy.titleEmphasis].join(' ');
    const section = within(screen.getByRole('region', { name: heading }));
    const form = section.getByRole('form', { name: copy.form.title });
    const channels = section.getByRole('list');
    expect(form.compareDocumentPosition(channels)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(section.getByText(copy.open.status)).toBeTruthy();
    expect(within(channels).queryByRole('link')).toBeNull();
    expect(
      within(channels)
        .getByRole('button', { name: copy.whatsapp.action })
        .hasAttribute('disabled'),
    ).toBe(true);
    expect(
      within(form)
        .getAllByRole('option')
        .slice(1)
        .map(({ textContent }) => textContent),
    ).toEqual(Object.values(copy.form.reasons));
    expect(
      within(form)
        .getByRole('button', { name: copy.form.submit })
        .hasAttribute('disabled'),
    ).toBe(true);
    expect(section.getByText(copy.form.unavailable)).toBeTruthy();
  },
);

it('validates required fields and email, counts the message, and leaves submission unavailable', () => {
  const copy = getDictionary('es').landing.contact;
  render(<ContactSection copy={copy} channels={unsetChannels} locale="es" />);
  const form = screen.getByRole<HTMLFormElement>('form', {
    name: copy.form.title,
  });
  const required = ['name', 'email', 'reason', 'message'] as const;
  for (const field of required) {
    const input = screen.getByRole(
      field === 'reason' ? 'combobox' : 'textbox',
      {
        name: copy.form[field].label,
      },
    );
    expect(input.hasAttribute('required')).toBe(true);
    fireEvent.blur(input);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  }
  expect(
    screen
      .getByRole('textbox', { name: copy.form.phone.label })
      .hasAttribute('required'),
  ).toBe(false);
  expect(form.checkValidity()).toBe(false);

  const email = screen.getByRole('textbox', { name: copy.form.email.label });
  fireEvent.change(email, { target: { value: 'invalid' } });
  expect(screen.getByText(copy.form.invalidEmail).id).toBe(
    email.getAttribute('aria-describedby'),
  );
  fireEvent.change(email, { target: { value: 'studio@example.com' } });
  expect(email.hasAttribute('aria-invalid')).toBe(false);

  const message = screen.getByRole<HTMLTextAreaElement>('textbox', {
    name: copy.form.message.label,
  });
  fireEvent.change(message, { target: { value: 'a'.repeat(505) } });
  expect(message.maxLength).toBe(500);
  expect(message.value).toHaveLength(500);
  expect(screen.getByText('500/500')).toBeTruthy();
  fireEvent.change(
    screen.getByRole('textbox', { name: copy.form.name.label }),
    { target: { value: 'Ada' } },
  );
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'game' } });
  expect(form.checkValidity()).toBe(true);
  expect(fireEvent.submit(form)).toBe(false);
  expect(message.value).toHaveLength(500);
});

it('restores the draft in the same tab after switching to the other language', async () => {
  const spanish = getDictionary('es').landing.contact;
  const { unmount } = render(
    <ContactSection copy={spanish} channels={unsetChannels} locale="es" />,
  );
  fireEvent.change(
    screen.getByRole('textbox', { name: spanish.form.name.label }),
    { target: { value: 'Ada' } },
  );
  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: 'immersive' },
  });
  fireEvent.change(
    screen.getByRole('textbox', { name: spanish.form.message.label }),
    { target: { value: 'Hola' } },
  );
  unmount();

  const english = getDictionary('en').landing.contact;
  render(
    <ContactSection copy={english} channels={unsetChannels} locale="en" />,
  );
  await waitFor(() => expect(screen.getByDisplayValue('Ada')).toBeTruthy());
  expect(screen.getByDisplayValue(english.form.reasons.immersive)).toBeTruthy();
  expect(screen.getByDisplayValue('Hola')).toBeTruthy();
  expect(screen.getByText('4/500')).toBeTruthy();
});
