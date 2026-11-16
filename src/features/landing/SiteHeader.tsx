import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/types';
import { LanguagePicker } from './LanguagePicker';
import styles from './SiteHeader.module.scss';
import { SiteNavigation } from './SiteNavigation';
import { StickyHeader } from './StickyHeader';

type HeaderCopy = Dictionary['landing']['header'];

export function SiteHeader({
  copy,
  locale,
  whatsappHref,
}: {
  copy: HeaderCopy;
  locale: Locale;
  whatsappHref: string | undefined;
}) {
  const { skip, language, languageNames, ...navigation } = copy;

  return (
    <StickyHeader className={styles.header}>
      <a className={styles.skip} href="#content">
        {skip}
      </a>
      <div className={styles.surface}>
        <div className={styles.bar}>
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
          <SiteNavigation
            key={locale}
            copy={navigation}
            whatsappHref={whatsappHref}
          />
          <LanguagePicker
            label={language}
            names={languageNames}
            locale={locale}
          />
        </div>
      </div>
    </StickyHeader>
  );
}
