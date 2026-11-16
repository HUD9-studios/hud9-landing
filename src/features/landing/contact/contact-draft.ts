import type { CountryCode } from 'libphonenumber-js';
import {
  isContactReason,
  messageLimit,
  type ContactFieldName,
} from './contact-message';
import {
  defaultPhoneCountry,
  readPhoneCountry,
  splitInternationalPhone,
} from './contact-phone';

export interface ContactDraft {
  name: string;
  email: string;
  phone: string;
  phoneCountry: CountryCode;
  reason: string;
  message: string;
}

export const emptyDraft: ContactDraft = {
  name: '',
  email: '',
  phone: '',
  phoneCountry: defaultPhoneCountry,
  reason: '',
  message: '',
};

const draftKey = 'hud9-contact-draft';

type ContactTouched = Partial<Record<ContactFieldName, true>>;

export interface ContactSession {
  draft: ContactDraft;
  touched: ContactTouched;
}

export const emptyContactSession: ContactSession = {
  draft: emptyDraft,
  touched: {},
};

const fields = ['name', 'email', 'phone', 'reason', 'message'] as const;

export function readContactDraft(
  reasons: Parameters<typeof isContactReason>[1],
): ContactSession {
  try {
    const values: unknown = JSON.parse(
      sessionStorage.getItem(draftKey) ?? 'null',
    );
    if (typeof values !== 'object' || values === null)
      return emptyContactSession;
    const saved = values as Record<string, unknown>;
    const read = (field: keyof ContactDraft) =>
      typeof saved[field] === 'string' ? saved[field] : '';

    const phone = read('phone');
    const phoneCountry = readPhoneCountry(read('phoneCountry'));
    const reason = read('reason');
    return {
      touched: readTouched(saved.touched),
      draft: {
        name: read('name'),
        email: read('email'),
        phone,
        phoneCountry,
        ...splitInternationalPhone(phone, phoneCountry),
        reason: isContactReason(reason, reasons) ? reason : '',
        message: read('message').slice(0, messageLimit),
      },
    };
  } catch {
    return emptyContactSession;
  }
}

function readTouched(value: unknown): ContactTouched {
  if (!value || typeof value !== 'object') return {};
  const saved = value as Record<string, unknown>;
  return Object.fromEntries(
    fields
      .filter((field) => saved[field] === true)
      .map((field) => [field, true]),
  );
}

export function saveContactDraft({ draft, touched }: ContactSession) {
  const { phoneCountry, ...values } = draft;
  try {
    if (
      phoneCountry !== defaultPhoneCountry ||
      Object.values(values).some(Boolean) ||
      Object.keys(touched).length > 0
    ) {
      sessionStorage.setItem(draftKey, JSON.stringify({ ...draft, touched }));
    } else {
      sessionStorage.removeItem(draftKey);
    }
  } catch {
    // The form remains editable when the browser blocks storage.
  }
}
