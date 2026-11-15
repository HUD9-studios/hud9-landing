import type { Dictionary } from '@/i18n/dictionaries/types';
import styles from './HeroIntro.module.scss';

export function HeroIntro({ copy }: { copy: Dictionary['landing']['hero'] }) {
  return (
    <section className={styles.intro} aria-labelledby="hero-title">
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <h1 id="hero-title">
        <span>{copy.titleStart}</span> <strong>{copy.titleEmphasis}</strong>{' '}
        <small>{copy.titleTail}</small>
      </h1>
      <p className={styles.description}>{copy.description}</p>
      <a className={styles.cta} href="#studio">
        {copy.action}
        <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
