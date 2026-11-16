import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/types';
import { LandingIcon } from '../LandingIcon';
import { WhatsAppIcon, WhatsAppLink } from '../WhatsAppLink';
import { ContactForm } from './ContactForm';
import styles from './ContactSection.module.scss';

type ContactCopy = Dictionary['landing']['contact'];
type Channels = { email: string | undefined; whatsappHref: string | undefined };

export function ContactSection({
  copy,
  channels,
  locale,
}: {
  copy: ContactCopy;
  channels: Channels;
  locale: Locale;
}) {
  return (
    <section
      id="contact"
      className={styles.contact}
      aria-labelledby="contact-title"
      tabIndex={-1}
    >
      <div className={styles.layout}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{copy.label}</p>
          <h2 id="contact-title">
            {copy.titleStart} <strong>{copy.titleEmphasis}</strong>
          </h2>
          <p className={styles.description}>{copy.description}</p>
        </div>
        <div className={styles.content}>
          <ContactForm copy={copy.form} locale={locale} />
          <ContactChannels copy={copy} channels={channels} />
        </div>
      </div>
    </section>
  );
}

function ContactChannels({
  copy: { open, email, whatsapp },
  channels,
}: {
  copy: Pick<ContactCopy, 'open' | 'email' | 'whatsapp'>;
  channels: Channels;
}) {
  return (
    <ul className={styles.channels}>
      <li className={styles.card}>
        <span className={styles.icon}>
          <LandingIcon name="signal" />
        </span>
        <div>
          <h3>{open.title}</h3>
          <p>{open.description}</p>
          <p className={styles.status}>{open.status}</p>
        </div>
      </li>
      <li className={styles.card}>
        <span className={styles.icon}>
          <LandingIcon name="email" />
        </span>
        <div>
          <h3>{email.title}</h3>
          <p>{email.description}</p>
          {channels.email && (
            <a href={`mailto:${channels.email}`}>{channels.email}</a>
          )}
        </div>
      </li>
      <li className={`${styles.card} ${styles.whatsapp}`}>
        <span className={styles.icon}>
          <WhatsAppIcon />
        </span>
        <div>
          <h3>{whatsapp.title}</h3>
          <p>{whatsapp.description}</p>
          <WhatsAppLink
            href={channels.whatsappHref}
            label={whatsapp.action}
            unavailable={whatsapp.unavailable}
            className={styles.whatsappAction}
          />
          {!channels.whatsappHref && (
            <p className={styles.unavailable}>{whatsapp.unavailable}</p>
          )}
        </div>
      </li>
    </ul>
  );
}
