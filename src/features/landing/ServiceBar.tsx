import type { Dictionary } from '@/i18n/dictionaries/types';
import { LandingIcon } from './LandingIcon';
import styles from './ServiceBar.module.scss';

const serviceIcons = ['games', 'vr', 'ar', 'simulators'] as const;

export function ServiceBar({
  copy,
}: {
  copy: Dictionary['landing']['services'];
}) {
  return (
    <section className={styles.services} aria-label={copy.label}>
      <ul>
        {serviceIcons.map((name) => (
          <li key={name}>
            <LandingIcon name={name} />
            <div>
              <h2>{copy[name].title}</h2>
              <p>{copy[name].description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
