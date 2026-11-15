import Image from 'next/image';
import type { Dictionary } from '@/i18n/dictionaries/types';
import { LandingIcon } from './LandingIcon';
import styles from './CoreProtocolPanel.module.scss';

export function CoreProtocolPanel({
  copy,
}: {
  copy: Dictionary['landing']['protocol'];
}) {
  const [core, protocol, number] = copy.title.split(' ');
  return (
    <article
      id="projects"
      className={styles.panel}
      aria-labelledby="protocol-title"
      tabIndex={-1}
    >
      <p className={styles.eyebrow}>
        <LandingIcon name="games" />
        {copy.eyebrow}
      </p>
      <h2 className={styles.title} id="protocol-title" aria-label={copy.title}>
        <span>
          {core}
          <i aria-hidden="true" />
        </span>
        <span>
          {protocol} <em>{number}</em>
        </span>
      </h2>
      <Image
        className={styles.art}
        src="/images/hero/core-protocol-09.webp"
        alt=""
        width={800}
        height={693}
        loading="eager"
        unoptimized
      />
      <p className={styles.description}>{copy.description}</p>
      <details className={styles.details}>
        <summary>
          <span aria-hidden="true" />
          {copy.action}
        </summary>
        <p>{copy.status}</p>
      </details>
    </article>
  );
}
