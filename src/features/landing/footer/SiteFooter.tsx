import Image from 'next/image';
import type { Dictionary } from '@/i18n/dictionaries/types';
import type { getContactChannels } from '../contact-channels';
import { LandingIcon } from '../LandingIcon';
import { landingSections } from '../landing-sections';
import { WhatsAppIcon } from '../WhatsAppLink';
import { FooterYear } from './FooterYear';
import styles from './SiteFooter.module.scss';

type FooterCopy = Dictionary['landing']['footer'];
type SocialChannels = Pick<
  ReturnType<typeof getContactChannels>,
  'instagramHref' | 'facebookHref' | 'whatsappHref'
>;

const sectionIcons = {
  home: 'home',
  studio: 'games',
  contact: 'email',
} as const;
const socialChannels = [
  { key: 'instagramHref', label: 'Instagram', Icon: InstagramIcon },
  { key: 'facebookHref', label: 'Facebook', Icon: FacebookIcon },
  { key: 'whatsappHref', label: 'WhatsApp', Icon: WhatsAppIcon },
] as const;

export function SiteFooter({
  copy,
  channels,
}: {
  copy: FooterCopy;
  channels: SocialChannels;
}) {
  return (
    <footer className={styles.footer}>
      <div className={styles.layout}>
        <div className={styles.topLine} aria-hidden="true">
          <span />
        </div>
        <div className={styles.columns}>
          <div className={styles.brand}>
            <Image
              src="/images/brand/logo/hud9-logo-white.webp"
              alt="HUD9 Studios"
              width={512}
              height={176}
              unoptimized
            />
            <p>{copy.tagline}</p>
          </div>
          <nav className={styles.explore} aria-labelledby="footer-explore">
            <h2 id="footer-explore" className={styles.heading}>
              {copy.explore}
            </h2>
            <ul>
              {landingSections.map((id) => (
                <li key={id}>
                  <a href={`#${id}`}>
                    <LandingIcon name={sectionIcons[id]} />
                    {copy.links[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <FooterSocial copy={copy} channels={channels} />
        </div>
        <div className={styles.bottom}>
          <p>
            © <FooterYear initialYear={new Date().getFullYear()} /> HUD9
            Studios. {copy.rights}
          </p>
          <p className={styles.signOff}>{copy.signOff}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterSocial({
  copy,
  channels,
}: {
  copy: FooterCopy;
  channels: SocialChannels;
}) {
  return (
    <section className={styles.connect} aria-labelledby="footer-connect">
      <h2 id="footer-connect" className={styles.heading}>
        {copy.connect}
      </h2>
      <ul>
        {socialChannels.map(({ key, label, Icon }) => {
          const href = channels[key];
          const unavailable = `${label} · ${copy.socialUnavailable}`;
          return (
            <li key={key}>
              {href ? (
                <a
                  className={styles.social}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Icon />
                </a>
              ) : (
                <button
                  className={styles.social}
                  type="button"
                  disabled
                  aria-label={unavailable}
                  title={unavailable}
                >
                  <Icon />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p>{copy.socialNote}</p>
    </section>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.15" />
      <circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14 22v-9h3l.5-3.5H14V7.2c0-1 .3-1.7 1.8-1.7h1.9V2.4c-.4-.1-1.5-.2-2.8-.2-2.8 0-4.7 1.6-4.7 4.7v2.6H7V13h3.2v9H14Z" />
    </svg>
  );
}
