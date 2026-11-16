'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { locales, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/types';
import styles from './SiteHeader.module.scss';
import { useHeaderSection, type HeaderSection } from './StickyHeader';

let pendingSection: { locale: Locale; section: HeaderSection } | undefined;

export function LanguagePicker({
  label,
  names,
  locale,
}: {
  label: string;
  names: Dictionary['landing']['header']['languageNames'];
  locale: Locale;
}) {
  const section = useHeaderSection();
  const fragment = section === 'home' ? '' : '#' + section;
  useRestoreTranslatedSection(locale);

  return (
    <details key={locale} className={styles.language}>
      <summary aria-label={label + ' · ' + names[locale]}>
        {locale}
        <span aria-hidden="true" />
      </summary>
      <ul>
        {locales.map((option) => (
          <li key={option}>
            <Link
              href={`/${option}${fragment}`}
              hrefLang={option}
              aria-current={option === locale ? 'page' : undefined}
              scroll={option === locale || section === 'home'}
              onNavigate={() => {
                pendingSection =
                  option !== locale && section !== 'home'
                    ? { locale: option, section }
                    : undefined;
              }}
            >
              <span>{option.toUpperCase()}</span> {names[option]}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

function useRestoreTranslatedSection(locale: Locale) {
  useEffect(() => {
    const requested = pendingSection;
    if (requested?.locale !== locale) return;

    // Studio computes its pinned height when the translated page mounts.
    const frame = window.requestAnimationFrame(() => {
      if (pendingSection !== requested) return;
      pendingSection = undefined;
      if (window.location.hash !== '#' + requested.section) return;
      const target = document.getElementById(requested.section);
      target?.scrollIntoView({ block: 'start', behavior: 'instant' });
      target?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [locale]);
}
