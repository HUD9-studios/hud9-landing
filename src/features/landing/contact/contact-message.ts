import type { E164Number } from 'libphonenumber-js';
import type { Dictionary } from '@/i18n/dictionaries/types';
import type { ContactDraft } from './contact-draft';
import { parseContactPhone } from './contact-phone';

export const messageLimit = 500;

const domainLabel = String.raw`[a-zA-Z\d](?:[a-zA-Z\d\-]{0,61}[a-zA-Z\d])?`;
export const contactEmailPattern = String.raw`[\w.!#$%&'*+\/=?^\x60\{\|\}~\-]+@${domainLabel}(?:\.${domainLabel})+`;
const emailFormat = new RegExp(`^${contactEmailPattern}$`, 'u');

type Reasons = Dictionary['landing']['contact']['form']['reasons'];
type ContactReason = keyof Reasons;
export type ContactFieldName = Exclude<keyof ContactDraft, 'phoneCountry'>;
type ContactErrors = Partial<{
  name: 'required' | 'nameLength';
  email: 'invalidEmail';
  phone: 'invalidPhone';
  contactMethod: 'contactMethodRequired';
  reason: 'invalidReason';
  message: 'messageTooShort' | 'messageTooLong';
}>;

type ContactMethod =
  | { email: string; phone?: E164Number }
  | { email?: never; phone: E164Number };

/** Local model for a valid message. The API adapter will map it to the API contract. */
export type ContactMessage = ContactMethod & {
  name: string;
  reason?: ContactReason;
  message?: string;
};

export function isContactReason(
  value: string,
  reasons: Reasons,
): value is ContactReason {
  return Object.hasOwn(reasons, value);
}

export function validateContactDraft(draft: ContactDraft, reasons: Reasons) {
  const name = draft.name.trim();
  const message = draft.message.trim();
  const reason = isContactReason(draft.reason, reasons)
    ? draft.reason
    : undefined;
  const { errors, method } = validateContactMethods(draft);

  const nameError = validateName(name);
  const messageError = validateMessage(message, draft.message.length);
  if (nameError) errors.name = nameError;
  if (draft.reason && !reason) errors.reason = 'invalidReason';
  if (messageError) errors.message = messageError;

  const submission: ContactMessage | undefined =
    method && !errors.reason && !errors.name && !errors.message
      ? { ...method, name, reason, message: message || undefined }
      : undefined;

  return { errors, submission };
}

function validateName(name: string): ContactErrors['name'] {
  if (!name) return 'required';
  const length = [...name.normalize()].length;
  if (length < 2 || length > 100) return 'nameLength';
}

function validateMessage(
  message: string,
  rawLength: number,
): ContactErrors['message'] {
  if (!message) return;
  if (message.length < 10) return 'messageTooShort';
  if (rawLength > messageLimit) return 'messageTooLong';
}

function validateContactMethods(draft: ContactDraft): {
  errors: ContactErrors;
  method?: ContactMethod;
} {
  const email = draft.email.trim();
  const phone = draft.phone.trim();
  if (!email && !phone)
    return { errors: { contactMethod: 'contactMethodRequired' } };

  const phoneNumber = phone
    ? parseContactPhone(phone, draft.phoneCountry)?.number
    : undefined;
  const errors: ContactErrors = {};
  if (phone && !phoneNumber) errors.phone = 'invalidPhone';
  if (!email)
    return phoneNumber
      ? { errors, method: { phone: phoneNumber } }
      : { errors };

  if (!isContactEmail(email)) errors.email = 'invalidEmail';
  if (errors.email || errors.phone) return { errors };
  return { errors, method: { email, phone: phoneNumber } };
}

function isContactEmail(email: string) {
  const [local] = email.split('@');
  return (
    !local.startsWith('.') &&
    !local.endsWith('.') &&
    !local.includes('..') &&
    emailFormat.test(email)
  );
}
