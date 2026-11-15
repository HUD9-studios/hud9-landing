'use client';

import { useRef, useState } from 'react';
import type { Dictionary } from '@/i18n/dictionaries/types';
import styles from './SiteNavigation.module.scss';

type NavigationCopy = Omit<
  Dictionary['landing']['header'],
  'skip' | 'language' | 'languageNames'
>;

type NavigationLinksCopy = Omit<
  NavigationCopy,
  'menu' | 'navigation' | 'whatsappPending'
>;

export function SiteNavigation({
  copy: { menu, navigation, whatsappPending, ...links },
}: {
  copy: NavigationCopy;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  return (
    <div
      className={styles.navGroup}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !open) return;
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      }}
    >
      <button
        ref={trigger}
        type="button"
        className={styles.menuToggle}
        aria-label={menu}
        aria-controls="primary-navigation"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d={open ? 'm6 6 12 12M18 6 6 18' : 'M3 6h18M3 12h18M3 18h18'} />
        </svg>
      </button>
      <nav
        id="primary-navigation"
        className={styles.navigation}
        aria-label={navigation}
      >
        <NavigationLinks
          copy={links}
          onNavigate={(id) => {
            if (!open) return;
            setOpen(false);
            document.getElementById(id)?.focus({ preventScroll: true });
          }}
        />
        <WhatsAppButton label={whatsappPending} />
      </nav>
    </div>
  );
}

function WhatsAppButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className={styles.whatsapp}
      aria-label={label}
      title={label}
      disabled
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20.8 11.7a8.8 8.8 0 0 1-13 7.7L3 20.8l1.4-4.6a8.8 8.8 0 1 1 16.4-4.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9.4 7.2a.8.8 0 0 0-.7-.3c-.4 0-1.2.7-1.2 1.9s1 2.9 2.6 4.5c1.5 1.5 3.2 2.4 4.5 2.4s1.9-.7 1.9-1.2c0-.3-.1-.5-.4-.7l-1.8-1a.6.6 0 0 0-.8.1l-.7.8c-1.1-.5-2.7-1.9-3.1-3l.7-.7c.2-.2.3-.5.1-.8l-1.1-2Z"
          fill="currentColor"
        />
      </svg>
      WhatsApp
    </button>
  );
}

function NavigationLinks({
  copy,
  onNavigate,
}: {
  copy: NavigationLinksCopy;
  onNavigate: (id: string) => void;
}) {
  const links = [
    ['home', copy.home],
    ['studio', copy.studio],
  ] as const;

  return (
    <ul>
      {links.map(([id, label]) => (
        <li key={id}>
          <a
            href={`#${id}`}
            className={id === 'home' ? styles.home : undefined}
            aria-current={id === 'home' ? 'page' : undefined}
            onClick={() => onNavigate(id)}
          >
            {label}
          </a>
        </li>
      ))}
      <li>
        <span
          role="link"
          aria-disabled="true"
          aria-label={copy.contactPending}
          title={copy.contactPending}
        >
          {copy.contact}
        </span>
      </li>
    </ul>
  );
}
