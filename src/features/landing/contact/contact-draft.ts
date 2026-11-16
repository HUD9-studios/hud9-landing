import type { CountryCode } from 'libphonenumber-js';
import { isContactReason, messageLimit } from './contact-message';
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

export function readContactDraft(
  reasons: Parameters<typeof isContactReason>[1],
): ContactDraft {
  try {
    const values: unknown = JSON.parse(
      sessionStorage.getItem(draftKey) ?? 'null',
    );
    if (typeof values !== 'object' || values === null) return emptyDraft;
    const saved = values as Record<string, unknown>;
    const read = (field: keyof ContactDraft) =>
      typeof saved[field] === 'string' ? saved[field] : '';

    const phone = read('phone');
    const phoneCountry = readPhoneCountry(read('phoneCountry'));
    const reason = read('reason');
    return {
      name: read('name'),
      email: read('email'),
      phone,
      phoneCountry,
      ...splitInternationalPhone(phone, phoneCountry),
      reason: isContactReason(reason, reasons) ? reason : '',
      message: read('message').slice(0, messageLimit),
    };
  } catch {
    return emptyDraft;
  }
}

export function saveContactDraft(draft: ContactDraft) {
  const { phoneCountry, ...fields } = draft;
  try {
    if (
      phoneCountry !== defaultPhoneCountry ||
      Object.values(fields).some(Boolean)
    ) {
      sessionStorage.setItem(draftKey, JSON.stringify(draft));
    } else {
      sessionStorage.removeItem(draftKey);
    }
  } catch {
    // The form remains editable when the browser blocks storage.
  }
}
