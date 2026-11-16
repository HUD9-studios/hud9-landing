import type { E164Number } from 'libphonenumber-js';
import type { Dictionary } from '@/i18n/dictionaries/types';
import type { ContactDraft } from './contact-draft';
import { parseContactPhone } from './contact-phone';

export const messageLimit = 500;

type Reasons = Dictionary['landing']['contact']['form']['reasons'];
type ContactReason = keyof Reasons;
export type ContactFieldName = Exclude<keyof ContactDraft, 'phoneCountry'>;
export type ContactErrors = Partial<
  Record<
    ContactFieldName,
    'required' | 'invalidEmail' | 'invalidPhone' | 'messageTooLong'
  >
>;

/** Local model for a valid message. The API adapter will map it to the API contract. */
export interface ContactMessage {
  name: string;
  email: string;
  phone?: E164Number;
  reason: ContactReason;
  message: string;
}

export function isContactReason(
  value: string,
  reasons: Reasons,
): value is ContactReason {
  return Object.hasOwn(reasons, value);
}

export function validateContactDraft(draft: ContactDraft, reasons: Reasons) {
  const name = draft.name.trim();
  const email = draft.email.trim();
  const phone = draft.phone.trim();
  const message = draft.message.trim();
  const reason = draft.reason;
  const phoneNumber = phone
    ? parseContactPhone(phone, draft.phoneCountry)?.number
    : undefined;
  const errors: ContactErrors = {};
  const validReason = isContactReason(reason, reasons);

  if (!name) errors.name = 'required';
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (phone && !phoneNumber) errors.phone = 'invalidPhone';
  if (!validReason) errors.reason = 'required';
  if (!message) errors.message = 'required';
  else if (draft.message.length > messageLimit)
    errors.message = 'messageTooLong';

  const submission: ContactMessage | undefined =
    validReason && !Object.keys(errors).length
      ? { name, email, phone: phoneNumber, reason, message }
      : undefined;

  return { errors, submission };
}

function validateEmail(email: string) {
  if (!email) return 'required';
  // Match the syntax used by the native email input.
  if (
    !/^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*$/i.test(
      email,
    )
  ) {
    return 'invalidEmail';
  }
}
