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
  message: 'Hello',
};

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

it('rejects an unknown reason and an overlong message before producing a submission', () => {
  const result = validateContactDraft(
    { ...base, reason: 'unknown', message: 'a'.repeat(501) },
    reasons,
  );
  expect(result.errors).toEqual({
    reason: 'required',
    message: 'messageTooLong',
  });
  expect(result.submission).toBeUndefined();
});
