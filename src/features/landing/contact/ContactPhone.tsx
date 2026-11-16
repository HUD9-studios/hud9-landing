import { useMemo, type ClipboardEvent } from 'react';
import type { CountryCode } from 'libphonenumber-js';
import 'country-flag-icons/3x2/flags.css';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/types';
import type { ContactDraft } from './contact-draft';
import { getPhoneCountries, splitInternationalPhone } from './contact-phone';
import formStyles from './ContactForm.module.scss';
import styles from './ContactPhone.module.scss';
import { PhoneCountryPicker } from './PhoneCountryPicker';

type PhoneDraft = Pick<ContactDraft, 'phone' | 'phoneCountry'>;
const inputId = 'contact-phone';
const errorId = 'contact-phone-error';

type PhoneProps = {
  copy: Dictionary['landing']['contact']['form']['phone'];
  locale: Locale;
  value: PhoneDraft;
  error: string | undefined;
  onChange: (next: PhoneDraft) => void;
  onTouched: () => void;
};

export function ContactPhone({
  copy,
  locale,
  value: { phone, phoneCountry },
  error,
  onChange,
  onTouched,
}: PhoneProps) {
  const countries = useMemo(() => getPhoneCountries(locale), [locale]);
  const country =
    countries.find(({ code }) => code === phoneCountry) ?? countries[0];

  return (
    <div className={formStyles.field} data-field="phone">
      <label htmlFor={inputId}>{copy.label}</label>
      <div className={styles.fields}>
        <PhoneCountryPicker
          copy={copy}
          countries={countries}
          country={country}
          onSelect={(code) => onChange({ phone, phoneCountry: code })}
        />
        <div className={formStyles.control}>
          <input
            id={inputId}
            className={styles.number}
            name="phone"
            type="tel"
            autoComplete="tel-national"
            placeholder={copy.placeholder}
            value={phone}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) =>
              onChange({ phone: event.currentTarget.value, phoneCountry })
            }
            onBlur={() => {
              const number = splitInternationalPhone(phone, phoneCountry);
              if (number) onChange(number);
              onTouched();
            }}
            onPaste={(event) =>
              pasteInternationalPhone(event, phoneCountry, onChange)
            }
          />
        </div>
      </div>
      {error && (
        <p id={errorId} className={formStyles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function pasteInternationalPhone(
  event: ClipboardEvent<HTMLInputElement>,
  country: CountryCode,
  onChange: PhoneProps['onChange'],
) {
  const input = event.currentTarget;
  if (input.selectionStart !== 0 || input.selectionEnd !== input.value.length)
    return;
  const number = splitInternationalPhone(
    event.clipboardData.getData('text'),
    country,
  );
  if (!number) return;
  event.preventDefault();
  onChange(number);
}
