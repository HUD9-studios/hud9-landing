'use client';

import { useRef, useState, type HTMLAttributes } from 'react';
import type { Dictionary } from '@/i18n/dictionaries/types';
import { landingSections } from './landing-sections';
import styles from './SiteNavigation.module.scss';
import { useHeaderSection, type HeaderSection } from './StickyHeader';
import { WhatsAppLink } from './WhatsAppLink';

type NavigationCopy = Omit<
  Dictionary['landing']['header'],
  'skip' | 'language' | 'languageNames'
>;

type NavigationLinksCopy = Omit<
  NavigationCopy,
  'menu' | 'navigation' | 'whatsappPending'
>;

type MenuDismissal = Pick<HTMLAttributes<HTMLElement>, 'onBlur' | 'onKeyDown'>;

type NavigationProps = {
  copy: NavigationCopy;
  whatsappHref: string | undefined;
};

export function SiteNavigation({ copy, whatsappHref }: NavigationProps) {
  const { menu, navigation, whatsappPending, ...links } = copy;
  const [open, setOpen] = useState(false);
  const group = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const active = useHeaderSection();
  const dismissal: MenuDismissal = {
    onBlur: (event) => {
      if (!group.current?.contains(event.relatedTarget)) setOpen(false);
    },
    onKeyDown: (event) => {
      if (event.key !== 'Escape' || !open) return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    },
  };

  return (
    <div ref={group} className={styles.navGroup}>
      <button
        ref={trigger}
        type="button"
        className={styles.menuToggle}
        aria-label={menu}
        aria-controls="primary-navigation"
        aria-expanded={open}
        {...dismissal}
        onClick={() => setOpen((previous) => !previous)}
      >
        <MenuIcon open={open} />
      </button>
      <nav
        id="primary-navigation"
        className={styles.navigation}
        aria-label={navigation}
      >
        <NavigationLinks
          copy={links}
          active={active}
          dismissal={dismissal}
          onNavigate={(id) => {
            if (!open) return;
            setOpen(false);
            document.getElementById(id)?.focus({ preventScroll: true });
          }}
        />
        <WhatsAppLink
          href={whatsappHref}
          label="WhatsApp"
          unavailable={whatsappPending}
          className={styles.whatsapp}
        />
      </nav>
    </div>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d={open ? 'm6 6 12 12M18 6 6 18' : 'M3 6h18M3 12h18M3 18h18'} />
    </svg>
  );
}

function NavigationLinks({
  copy,
  active,
  dismissal,
  onNavigate,
}: {
  copy: NavigationLinksCopy;
  active: HeaderSection;
  dismissal: MenuDismissal;
  onNavigate: (id: string) => void;
}) {
  return (
    <ul>
      {landingSections.map((id) => (
        <li key={id}>
          <a
            href={`#${id}`}
            aria-current={id === active ? 'location' : undefined}
            {...dismissal}
            onClick={() => onNavigate(id)}
          >
            {copy[id]}
          </a>
        </li>
      ))}
    </ul>
  );
}
