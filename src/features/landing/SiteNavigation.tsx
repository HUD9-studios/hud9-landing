'use client';

import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type RefObject,
} from 'react';
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

type MenuDismissal = Pick<HTMLAttributes<HTMLElement>, 'onBlur' | 'onKeyDown'>;
type ActiveSection = 'home' | 'studio' | null;

export function SiteNavigation({
  copy: { menu, navigation, whatsappPending, ...links },
}: {
  copy: NavigationCopy;
}) {
  const [open, setOpen] = useState(false);
  const group = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const active = useActiveSection(group);
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
        <WhatsAppButton label={whatsappPending} />
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
  active,
  dismissal,
  onNavigate,
}: {
  copy: NavigationLinksCopy;
  active: ActiveSection;
  dismissal: MenuDismissal;
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
            aria-current={id === active ? 'location' : undefined}
            {...dismissal}
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

function useActiveSection(group: RefObject<HTMLDivElement | null>) {
  const [active, setActive] = useState<ActiveSection>('home');

  useEffect(() => {
    const studio = document.getElementById('studio');
    const header = group.current?.closest('header');
    if (!studio || !header) return;

    let pendingFrame: number | undefined;
    let previous: ActiveSection | undefined;
    const update = () => {
      pendingFrame = undefined;
      const marker = header.getBoundingClientRect().bottom + 24;
      const { top, bottom } = studio.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const studioAtPageEnd =
        window.scrollY > 0 &&
        window.scrollY + viewportHeight >=
          document.documentElement.scrollHeight - 1 &&
        top < viewportHeight &&
        bottom >= viewportHeight - 1;
      let current: ActiveSection = 'home';
      if (bottom <= marker) current = null;
      else if (top <= marker || studioAtPageEnd) current = 'studio';
      if (current !== previous) {
        previous = current;
        setActive(current);
      }
    };
    const schedule = () => {
      pendingFrame ??= window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    return () => {
      if (pendingFrame !== undefined) window.cancelAnimationFrame(pendingFrame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, [group]);

  return active;
}
