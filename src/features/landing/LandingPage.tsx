import { PageContainer } from '@/components/PageContainer';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries/types';
import { ContactSection } from './contact/ContactSection';
import { getContactChannels } from './contact-channels';
import { CoreProtocolPanel } from './CoreProtocolPanel';
import { HeroIntro } from './HeroIntro';
import styles from './LandingPage.module.scss';
import { ServiceBar } from './ServiceBar';
import { SiteHeader } from './SiteHeader';
import { StudioSection } from './StudioSection';

export function LandingPage({
  copy,
  locale,
}: {
  copy: Dictionary['landing'];
  locale: Locale;
}) {
  const channels = getContactChannels();

  return (
    <div id="home" className={styles.landing} tabIndex={-1}>
      <SiteHeader
        copy={copy.header}
        locale={locale}
        whatsappHref={channels.whatsappHref}
      />
      <PageContainer id="content" className={styles.main}>
        <div className={styles.stage}>
          <div className={styles.hero}>
            <HeroIntro copy={copy.hero} />
            <CoreProtocolPanel copy={copy.protocol} />
          </div>
          <ServiceBar copy={copy.services} />
          <a
            className={styles.down}
            href="#studio"
            aria-label={copy.studio.title}
          >
            <span aria-hidden="true" />
          </a>
        </div>
        <StudioSection copy={copy.studio} />
        <ContactSection
          copy={copy.contact}
          channels={channels}
          locale={locale}
        />
      </PageContainer>
    </div>
  );
}
