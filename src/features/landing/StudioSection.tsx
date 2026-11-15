import type { Dictionary } from '@/i18n/dictionaries/types';
import styles from './StudioSection.module.scss';

export function StudioSection({
  copy,
}: {
  copy: Dictionary['landing']['studio'];
}) {
  return (
    <section
      className={styles.studio}
      id="studio"
      aria-labelledby="studio-title"
      tabIndex={-1}
    >
      <h2 id="studio-title">{copy.title}</h2>
      <p>{copy.description}</p>
      <h3 id="process" tabIndex={-1}>
        {copy.processTitle}
      </h3>
      <p>{copy.process}</p>
    </section>
  );
}
