import Image from 'next/image';
import Link from 'next/link';
import { locales, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/types';
import styles from './SiteHeader.module.scss';
import { SiteNavigation } from './SiteNavigation';

type HeaderCopy = Dictionary['landing']['header'];

export function SiteHeader({
  copy,
  locale,
}: {
  copy: HeaderCopy;
  locale: Locale;
}) {
  const { skip, language, languageNames, ...navigation } = copy;

  return (
    <header id="home" className={styles.header} tabIndex={-1}>
      <a className={styles.skip} href="#content">
        {skip}
      </a>
      <a className={styles.brand} href="#home">
        <Image
          src="/images/brand/logo/hud9-logo.webp"
          alt="HUD9 Studios"
          width={512}
          height={176}
          preload
          unoptimized
        />
      </a>
      <SiteNavigation key={locale} copy={navigation} />
      <LanguagePicker label={language} names={languageNames} locale={locale} />
    </header>
  );
}

function LanguagePicker({
  label,
  names,
  locale,
}: {
  label: string;
  names: HeaderCopy['languageNames'];
  locale: Locale;
}) {
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
              href={option === 'es' ? '/es' : '/en'}
              hrefLang={option}
              aria-current={option === locale ? 'page' : undefined}
            >
              <span>{option.toUpperCase()}</span> {names[option]}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
