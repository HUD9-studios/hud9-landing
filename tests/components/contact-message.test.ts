import { expect, it } from 'vitest';
import { emptyDraft } from '@/features/landing/contact/contact-draft';
import { validateContactDraft } from '@/features/landing/contact/contact-message';
import { getDictionary } from '@/i18n/dictionaries';

const reasons = getDictionary('en').landing.contact.form.reasons;
const base = {
  ...emptyDraft,
  name: 'Ada',
  email: 'ada@example.com',
  reason: 'game',
  message: 'Hello there',
};

it.each([
  ['  李雷  ', '李雷'],
  ["  María-José D'Ávila  ", "María-José D'Ávila"],
  ['A'.repeat(100), 'A'.repeat(100)],
])('accepts and trims the name %j', (name, expected) => {
  const { errors, submission } = validateContactDraft(
    { ...base, name },
    reasons,
  );
  expect(errors).toEqual({});
  expect(submission?.name).toBe(expected);
});

it.each([
  [' \t ', 'required'],
  [' Á ', 'nameLength'],
  ['A'.repeat(101), 'nameLength'],
])('rejects a name outside the allowed length %j', (name, error) => {
  const result = validateContactDraft({ ...base, name }, reasons);
  expect(result.errors).toEqual({ name: error });
  expect(result.submission).toBeUndefined();
});

it.each([
  ['315 555 0123', '+573155550123'],
  ['+44 20 7946 0018', '+442079460018'],
  ['00 34 612 34 56 78', '+34612345678'],
] as const)(
  'normalizes %s to %s in the local submission model',
  (phone, e164) => {
    const { submission, errors } = validateContactDraft(
      { ...base, phone },
      reasons,
    );
    expect(errors).toEqual({});
    expect(submission?.phone).toBe(e164);
  },
);

it.each([" o'neal+hud9@sub.example.co ", 'ada_123@example.travel'])(
  'accepts a valid email as the only contact method %j',
  (email) => {
    const { errors, submission } = validateContactDraft(
      { ...base, email },
      reasons,
    );
    expect(errors).toEqual({});
    expect(submission?.email).toBe(email.trim());
    expect(submission?.phone).toBeUndefined();
  },
);

it('accepts a valid national phone as the only contact method', () => {
  const { errors, submission } = validateContactDraft(
    { ...base, email: '', phone: '020 7946 0018', phoneCountry: 'GB' },
    reasons,
  );
  expect(errors).toEqual({});
  expect(submission?.phone).toBe('+442079460018');
  expect(submission?.email).toBeUndefined();
});

it('requires at least one contact method when both are blank', () => {
  const result = validateContactDraft(
    { ...base, email: ' ', phone: '\t' },
    reasons,
  );
  expect(result.errors).toEqual({ contactMethod: 'contactMethodRequired' });
  expect(result.submission).toBeUndefined();
});

it.each([
  'invalid',
  'holmesmojica@gmail',
  '.ada@example.com',
  'ada.@example.com',
  'a..da@example.com',
  'ada@example..com',
  'ada@-example.com',
])('rejects the malformed email %s even with a valid phone', (email) => {
  const result = validateContactDraft(
    { ...base, email, phone: '+44 20 7946 0018' },
    reasons,
  );
  expect(result.errors).toEqual({ email: 'invalidEmail' });
  expect(result.submission).toBeUndefined();
});

it('accepts a missing phone and rejects incomplete numbers, extensions and embedded text', () => {
  expect(validateContactDraft(base, reasons).submission?.phone).toBeUndefined();
  for (const phone of [
    '+34 12',
    '+1 202 555 0123 x4',
    'call +1 202 555 0123',
  ]) {
    const result = validateContactDraft({ ...base, phone }, reasons);
    expect(result.errors.phone).toBe('invalidPhone');
    expect(result.submission).toBeUndefined();
  }
});

it('rejects a national number that belongs to a different country on a shared code', () => {
  const result = validateContactDraft(
    { ...base, phoneCountry: 'CA', phone: '202 555 0123' },
    reasons,
  );
  expect(result.errors).toEqual({ phone: 'invalidPhone' });
  expect(result.submission).toBeUndefined();
});

it.each([
  ['', { phone: 'invalidPhone' }],
  ['invalid', { email: 'invalidEmail', phone: 'invalidPhone' }],
])('reports the invalid phone and any malformed email %j', (email, errors) => {
  const result = validateContactDraft(
    { ...base, email, phone: '+44 20' },
    reasons,
  );
  expect(result.errors).toEqual(errors);
  expect(result.submission).toBeUndefined();
});

it.each([
  [' 123456789 ', 'messageTooShort'],
  ['x'.repeat(501), 'messageTooLong'],
])('rejects an out-of-range message', (message, error) => {
  const result = validateContactDraft({ ...base, message }, reasons);
  expect(result.errors).toEqual({ message: error });
  expect(result.submission).toBeUndefined();
});

it.each([' 1234567890 ', 'x'.repeat(500)])(
  'accepts a message at the allowed boundaries',
  (message) => {
    const { errors, submission } = validateContactDraft(
      { ...base, message },
      reasons,
    );
    expect(errors).toEqual({});
    expect(submission?.message).toBe(message.trim());
  },
);

it('accepts a missing reason and a whitespace-only message as absent', () => {
  const { errors, submission } = validateContactDraft(
    { ...base, reason: '', message: '   ' },
    reasons,
  );
  expect(errors).toEqual({});
  expect(submission?.name).toBe(base.name);
  expect(submission?.reason).toBeUndefined();
  expect(submission?.message).toBeUndefined();
});

it.each(['unknown', 'toString'])(
  'rejects a supplied reason outside the list of allowed options',
  (reason) => {
    const result = validateContactDraft({ ...base, reason }, reasons);
    expect(result.errors).toEqual({ reason: 'invalidReason' });
    expect(result.submission).toBeUndefined();
  },
);
