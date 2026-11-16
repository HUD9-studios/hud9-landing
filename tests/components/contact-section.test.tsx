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
  const name = screen.getByRole('textbox', { name: copy.form.name.label });
  expect(name.hasAttribute('required')).toBe(true);
  fireEvent.blur(name);
  expect(name.getAttribute('aria-invalid')).toBe('true');
  expect(
    screen
      .getByRole('textbox', { name: copy.form.phone.label })
      .hasAttribute('required'),
  ).toBe(false);
  expect(form.checkValidity()).toBe(false);

  const email = screen.getByRole<HTMLInputElement>('textbox', {
    name: copy.form.email.label,
  });
  expect(email.hasAttribute('required')).toBe(false);
  fireEvent.change(email, { target: { value: 'holmesmojica@gmail' } });
  expect(email.validity.patternMismatch).toBe(true);
  expect(email.hasAttribute('aria-invalid')).toBe(false);
  fireEvent.blur(email);
  expect(screen.getByText(copy.form.invalidEmail).id).toBe(
    email.getAttribute('aria-describedby'),
  );
  fireEvent.change(email, { target: { value: 'holmesmojica@gmail.com' } });
  expect(email.validity.valid).toBe(true);
  expect(email.hasAttribute('aria-invalid')).toBe(false);

  const message = screen.getByRole<HTMLTextAreaElement>('textbox', {
    name: copy.form.message.label,
  });
  const reason = screen.getByRole<HTMLSelectElement>('combobox', {
    name: copy.form.reason.label,
  });
  fireEvent.change(name, { target: { value: 'Ada' } });
  fireEvent.change(reason, { target: { value: 'game' } });
  fireEvent.change(reason, { target: { value: '' } });
  expect(reason.value).toBe('');
  for (const field of [reason, message]) {
    fireEvent.blur(field);
    expect(field.hasAttribute('required')).toBe(false);
    expect(field.hasAttribute('aria-invalid')).toBe(false);
  }
  expect(form.checkValidity()).toBe(true);
  fireEvent.change(message, { target: { value: '  Hola  ' } });
  expect(screen.getByText(copy.form.messageTooShort).id).toBeTruthy();
  expect(message.value).toBe('  Hola  ');
  fireEvent.change(message, { target: { value: 'a'.repeat(505) } });
  expect(message.maxLength).toBe(500);
  expect(message.value).toHaveLength(500);
  expect(screen.getByText('500/500')).toBeTruthy();
  expect(form.checkValidity()).toBe(true);
  expect(fireEvent.submit(form)).toBe(false);
  expect(message.value).toHaveLength(500);
});

it.each(['es', 'en'] as const)(
  'links the shared contact requirement to both inputs in %s',
  (locale) => {
    const copy = getDictionary(locale).landing.contact;
    render(
      <ContactSection copy={copy} channels={unsetChannels} locale={locale} />,
    );
    const email = screen.getByRole('textbox', { name: copy.form.email.label });
    const phone = screen.getByRole('textbox', { name: copy.form.phone.label });
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.blur(phone);
    const error = screen.getByRole('alert');
    expect(error.textContent).toBe(copy.form.contactMethodRequired);
    for (const input of [email, phone]) {
      expect(input.getAttribute('aria-describedby')).toBe(error.id);
      expect(input.getAttribute('aria-invalid')).toBe('true');
    }

    fireEvent.change(phone, { target: { value: '+44 20 7946 0018' } });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(email.hasAttribute('aria-invalid')).toBe(false);
    expect(phone.hasAttribute('aria-invalid')).toBe(false);
    fireEvent.change(phone, { target: { value: '' } });
    expect(screen.getByRole('alert').textContent).toBe(
      copy.form.contactMethodRequired,
    );
    fireEvent.change(email, { target: { value: 'studio@example.com' } });
    expect(screen.queryByRole('alert')).toBeNull();
  },
);

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
  expect(screen.queryByRole('alert')).toBeNull();
});

it('relocalizes a touched field error after changing language and clears it after correction', async () => {
  const spanish = getDictionary('es').landing.contact;
  const { unmount } = render(
    <ContactSection copy={spanish} channels={unsetChannels} locale="es" />,
  );
  const invalid = '+44 20';
  const phone = screen.getByRole('textbox', { name: spanish.form.phone.label });
  fireEvent.change(phone, { target: { value: invalid } });
  fireEvent.blur(phone);
  expect(screen.getByRole('alert').textContent).toBe(spanish.form.invalidPhone);

  const name = screen.getByRole('textbox', { name: spanish.form.name.label });
  fireEvent.change(name, { target: { value: ' A ' } });
  expect(screen.queryByText(spanish.form.nameLength)).toBeNull();
  unmount();

  const english = getDictionary('en').landing.contact;
  render(
    <ContactSection copy={english} channels={unsetChannels} locale="en" />,
  );
  expect((await screen.findByRole('alert')).textContent).toBe(
    english.form.invalidPhone,
  );
  const restoredPhone = screen.getByRole<HTMLInputElement>('textbox', {
    name: english.form.phone.label,
  });
  expect(restoredPhone.value).toBe(invalid);
  expect(screen.queryByText(english.form.nameLength)).toBeNull();
  fireEvent.blur(
    screen.getByRole('textbox', { name: english.form.name.label }),
  );
  expect(screen.getByText(english.form.nameLength)).toBeTruthy();
  fireEvent.change(restoredPhone, { target: { value: '+44 20 7946 0018' } });
  expect(screen.queryByText(english.form.invalidPhone)).toBeNull();
});
