// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import {
  emptyContactSession,
  emptyDraft,
  readContactDraft,
  saveContactDraft,
} from '@/features/landing/contact/contact-draft';
import { getDictionary } from '@/i18n/dictionaries';

const key = 'hud9-contact-draft';
const reasons = getDictionary('es').landing.contact.form.reasons;

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

it('recovers from a corrupt draft and can save a usable one afterward', () => {
  sessionStorage.setItem(key, '{broken');
  expect(readContactDraft(reasons)).toEqual(emptyContactSession);
  const session = { draft: { ...emptyDraft, name: 'María' }, touched: {} };
  saveContactDraft(session);
  expect(readContactDraft(reasons)).toEqual(session);
});

it('keeps valid draft values and drops obsolete options and invalid metadata', () => {
  sessionStorage.setItem(
    key,
    JSON.stringify({
      name: 'María',
      email: false,
      phone: '+44 20',
      phoneCountry: 'ZZ',
      reason: 'obsolete',
      message: 'x'.repeat(520),
      touched: { phone: true, name: 'true', obsolete: true },
    }),
  );

  expect(readContactDraft(reasons)).toEqual({
    draft: {
      ...emptyDraft,
      name: 'María',
      phone: '+44 20',
      message: 'x'.repeat(500),
    },
    touched: { phone: true },
  });
});

it('persists a country-only draft and removes it when restored to defaults', () => {
  const session = {
    draft: { ...emptyDraft, phoneCountry: 'GB' as const },
    touched: {},
  };
  saveContactDraft(session);
  expect(readContactDraft(reasons)).toEqual(session);
  saveContactDraft(emptyContactSession);
  expect(sessionStorage.getItem(key)).toBeNull();
});

it('falls back gracefully when the browser denies access to session storage', () => {
  const denyAccess = () => {
    throw new DOMException('Storage disabled', 'SecurityError');
  };
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(denyAccess);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(denyAccess);
  expect(readContactDraft(reasons)).toEqual(emptyContactSession);
  const session = { draft: { ...emptyDraft, name: 'María' }, touched: {} };
  expect(() => saveContactDraft(session)).not.toThrow();
});
