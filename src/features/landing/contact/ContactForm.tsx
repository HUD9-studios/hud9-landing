'use client';

import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/types';
import { LandingIcon } from '../LandingIcon';
import {
  emptyDraft,
  readContactDraft,
  saveContactDraft,
  type ContactDraft,
} from './contact-draft';
import {
  messageLimit,
  validateContactDraft,
  type ContactFieldName,
} from './contact-message';
import styles from './ContactForm.module.scss';
import { ContactPhone } from './ContactPhone';

type FormCopy = Dictionary['landing']['contact']['form'];
type FieldControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function useContactFields(copy: FormCopy) {
  const [draft, setDraft] = useState(emptyDraft);
  const [touched, setTouched] = useState<
    Partial<Record<ContactFieldName, boolean>>
  >({});
  const { errors } = validateContactDraft(draft, copy.reasons);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDraft((current) =>
        current === emptyDraft ? readContactDraft(copy.reasons) : current,
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [copy.reasons]);

  function markTouched(field: ContactFieldName) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function errorFor(field: ContactFieldName) {
    const error = errors[field];
    return touched[field] && error ? copy[error] : undefined;
  }

  function update(fields: Partial<ContactDraft>) {
    const next = { ...draft, ...fields };
    setDraft(next);
    saveContactDraft(next);
  }

  function bind(field: Exclude<ContactFieldName, 'phone'>) {
    const id = `contact-${field}`;
    const error = errorFor(field);
    const descriptions = [
      error ? `${id}-error` : '',
      field === 'message' ? 'contact-message-count' : '',
    ].filter(Boolean);

    return {
      id,
      name: field,
      value: draft[field],
      'aria-invalid': Boolean(error) || undefined,
      'aria-describedby': descriptions.join(' ') || undefined,
      onBlur: () => markTouched(field),
      onChange: (event: ChangeEvent<FieldControl>) => {
        const control = event.currentTarget;
        const value =
          field === 'message'
            ? control.value.slice(0, messageLimit)
            : control.value;
        update({ [field]: value });
      },
    };
  }

  return { bind, draft, errorFor, markTouched, update };
}

type FieldProps = ReturnType<ReturnType<typeof useContactFields>['bind']>;

export function ContactForm({
  copy,
  locale,
}: {
  copy: FormCopy;
  locale: Locale;
}) {
  const fields = useContactFields(copy);

  return (
    <form
      className={styles.form}
      aria-labelledby="contact-form-title"
      onSubmit={(event) => event.preventDefault()}
    >
      <h3 id="contact-form-title">
        <LandingIcon name="send" />
        {copy.title}
      </h3>
      <ContactInputs copy={copy} fields={fields} />
      <ContactPhone
        copy={copy.phone}
        locale={locale}
        value={fields.draft}
        error={fields.errorFor('phone')}
        onChange={fields.update}
        onTouched={() => fields.markTouched('phone')}
      />
      <ContactReason
        copy={copy}
        field={fields.bind('reason')}
        error={fields.errorFor('reason')}
      />
      <ContactField
        label={copy.message.label}
        icon="message"
        field={fields.bind('message')}
        error={fields.errorFor('message')}
        required
      >
        <textarea
          {...fields.bind('message')}
          placeholder={copy.message.placeholder}
          maxLength={messageLimit}
          rows={3}
          required
        />
      </ContactField>
      <p id="contact-message-count" className={styles.count}>
        <span className={styles.srOnly}>{copy.characterCount} </span>
        {fields.draft.message.length}/{messageLimit}
      </p>
      <ContactSubmit copy={copy} />
    </form>
  );
}

function ContactSubmit({
  copy,
}: {
  copy: Pick<FormCopy, 'submit' | 'unavailable'>;
}) {
  return (
    <>
      <button
        className={styles.submit}
        type="submit"
        aria-describedby="contact-form-unavailable"
        disabled
      >
        <LandingIcon name="send" />
        {copy.submit}
      </button>
      <p className={styles.unavailable} id="contact-form-unavailable">
        {copy.unavailable}
      </p>
    </>
  );
}

function ContactReason({
  copy: { reason, reasons },
  field,
  error,
}: {
  copy: Pick<FormCopy, 'reason' | 'reasons'>;
  field: FieldProps;
  error: string | undefined;
}) {
  return (
    <ContactField
      label={reason.label}
      icon="games"
      field={field}
      error={error}
      required
    >
      <select {...field} required>
        <option value="" disabled>
          {reason.placeholder}
        </option>
        {Object.entries(reasons).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </ContactField>
  );
}

const inputs = [
  { name: 'name', type: 'text', icon: 'person' },
  { name: 'email', type: 'email', icon: 'email' },
] as const;

function ContactInputs({
  copy,
  fields,
}: {
  copy: FormCopy;
  fields: ReturnType<typeof useContactFields>;
}) {
  return inputs.map(({ name, type, icon }) => {
    const field = fields.bind(name);
    return (
      <ContactField
        key={name}
        label={copy[name].label}
        icon={icon}
        field={field}
        error={fields.errorFor(name)}
        required
      >
        <input
          {...field}
          type={type}
          autoComplete={name}
          placeholder={copy[name].placeholder}
          required
        />
      </ContactField>
    );
  });
}

function ContactField({
  label,
  icon,
  field,
  required,
  error,
  children,
}: {
  label: string;
  icon: 'person' | 'email' | 'games' | 'message';
  field: FieldProps;
  required: boolean;
  error: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className={styles.field} data-field={field.name}>
      <label htmlFor={field.id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div className={styles.control}>
        <LandingIcon name={icon} />
        {children}
      </div>
      {error && (
        <p className={styles.error} id={`${field.id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
