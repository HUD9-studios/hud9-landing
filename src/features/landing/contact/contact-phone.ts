import parsePhoneNumber, {
  getCountries,
  getCountryCallingCode,
  isSupportedCountry,
  type CountryCode,
} from 'libphonenumber-js/max';
import type { Locale } from '@/i18n/config';

export const defaultPhoneCountry = 'CO' satisfies CountryCode;

export function readPhoneCountry(code: string): CountryCode {
  return isSupportedCountry(code) ? (code as CountryCode) : defaultPhoneCountry;
}

export function parseContactPhone(value: string, country: CountryCode) {
  const text = value.trim();
  const international = text.startsWith('+') || text.startsWith('00');
  const phone = parsePhoneNumber(
    text.startsWith('00') ? '+' + text.slice(2) : text,
    {
      defaultCountry: country,
      extract: false,
    },
  );
  if (!phone?.isValid() || phone.ext) return undefined;
  const matchesCountry = phone.country
    ? phone.country === country
    : phone.getPossibleCountries().includes(country);
  if (!international && !matchesCountry) return undefined;
  return phone;
}

export function splitInternationalPhone(value: string, country: CountryCode) {
  const text = value.trim();
  if (!text.startsWith('+') && !text.startsWith('00')) return undefined;
  const phone = parseContactPhone(text, country);
  return phone?.country
    ? { phoneCountry: phone.country, phone: phone.nationalNumber }
    : undefined;
}

export interface PhoneCountry {
  code: CountryCode;
  name: string;
  callingCode: string;
}

export function getPhoneCountries(locale: Locale): PhoneCountry[] {
  const names = new Intl.DisplayNames(locale, { type: 'region' });
  const collator = new Intl.Collator(locale);
  return getCountries()
    .map((code) => ({
      code,
      name: names.of(code) ?? code,
      callingCode: getCountryCallingCode(code),
    }))
    .sort((a, b) => collator.compare(a.name, b.name));
}

function searchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function searchPhoneCountries(countries: PhoneCountry[], query: string) {
  const term = searchText(query.trim());
  if (!term) return countries;
  if (/^\+?\s*\d+$/.test(term)) {
    const digits = term.replace(/^\+?\s*/, '');
    return countries.filter(({ callingCode }) =>
      callingCode.startsWith(digits),
    );
  }
  return countries.filter(({ name }) => searchText(name).includes(term));
}
