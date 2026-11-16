'use client';

import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/types';
import { LandingIcon } from '../LandingIcon';
import {
  emptyContactSession,
  readContactDraft,
  saveContactDraft,
  type ContactDraft,
} from './contact-draft';
import {
  contactEmailPattern,
  messageLimit,
  validateContactDraft,
  type ContactFieldName,
} from './contact-message';
import styles from './ContactForm.module.scss';
import { ContactPhone } from './ContactPhone';

type FormCopy = Dictionary['landing']['contact']['form'];
type FieldControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const contactMethodErrorId = 'contact-method-error';

function useContactFields(copy: FormCopy) {
  const [session, setSession] = useState(emptyContactSession);
  const { draft, touched } = session;
  const { errors } = validateContactDraft(draft, copy.reasons);
  const showMethodError = Boolean(
    errors.contactMethod && (touched.email || touched.phone),
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSession((current) =>
        current === emptyContactSession
          ? readContactDraft(copy.reasons)
          : current,
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [copy.reasons]);

  function errorFor(field: ContactFieldName) {
    const error = errors[field];
    return touched[field] && error ? copy[error] : undefined;
  }

  function update(fields: Partial<ContactDraft>, touch?: ContactFieldName) {
    const next = {
      draft: { ...draft, ...fields },
      touched: touch ? { ...touched, [touch]: true as const } : touched,
    };
    setSession(next);
    saveContactDraft(next);
  }

  function bind(field: Exclude<ContactFieldName, 'phone'>) {
    const id = `contact-${field}`;
    const error = errorFor(field);
    const methodError = field === 'email' && showMethodError;

    return {
      id,
      name: field,
      value: draft[field],
      'aria-invalid': Boolean(error || methodError) || undefined,
      'aria-describedby': fieldDescriptions(field, error, methodError),
      onBlur: () => update({}, field),
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

  return { bind, draft, errorFor, showMethodError, update };
}

function fieldDescriptions(
  field: ContactFieldName,
  error: string | undefined,
  methodError: boolean,
) {
  return (
    [
      error ? `contact-${field}-error` : '',
      field === 'message' ? 'contact-message-count' : '',
      methodError ? contactMethodErrorId : '',
    ]
      .filter(Boolean)
      .join(' ') || undefined
  );
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
        methodErrorId={
          fields.showMethodError ? contactMethodErrorId : undefined
        }
        onChange={fields.update}
        onTouched={(phone) => fields.update(phone ?? {}, 'phone')}
      />
      {fields.showMethodError && (
        <p id={contactMethodErrorId} className={styles.error} role="alert">
          {copy.contactMethodRequired}
        </p>
      )}
      <ContactReason
        copy={copy}
        field={fields.bind('reason')}
        error={fields.errorFor('reason')}
      />
      <ContactMessageField
        copy={copy}
        field={fields.bind('message')}
        error={fields.errorFor('message')}
      />
      <ContactSubmit copy={copy} />
    </form>
  );
}

function ContactMessageField({
  copy,
  field,
  error,
}: {
  copy: Pick<FormCopy, 'message' | 'characterCount'>;
  field: FieldProps;
  error: string | undefined;
}) {
  return (
    <>
      <ContactField
        label={copy.message.label}
        icon="message"
        field={field}
        error={error}
      >
        <textarea
          {...field}
          placeholder={copy.message.placeholder}
          maxLength={messageLimit}
          rows={3}
        />
      </ContactField>
      <p id="contact-message-count" className={styles.count}>
        <span className={styles.srOnly}>{copy.characterCount} </span>
        {field.value.length}/{messageLimit}
      </p>
    </>
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
    <ContactField label={reason.label} icon="games" field={field} error={error}>
      <select {...field}>
        <option value="">{reason.placeholder}</option>
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
    const required = name === 'name';
    return (
      <ContactField
        key={name}
        label={copy[name].label}
        icon={icon}
        field={field}
        error={fields.errorFor(name)}
        required={required}
      >
        <input
          {...field}
          type={type}
          autoComplete={name}
          placeholder={copy[name].placeholder}
          pattern={name === 'email' ? contactEmailPattern : undefined}
          required={required}
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
  required?: boolean;
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
