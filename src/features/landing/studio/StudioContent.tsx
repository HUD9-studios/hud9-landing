import type { Dictionary } from '@/i18n/dictionaries/types';
import { LandingIcon } from '../LandingIcon';
import styles from './StudioContent.module.scss';
import { StudioReveal } from './StudioReveal';

const pillars = ['experience', 'creativity', 'technology'] as const;

export function StudioContent({
  copy,
}: {
  copy: Dictionary['landing']['studio'];
}) {
  return (
    <StudioReveal className={styles.content}>
      <div className={styles.lead} data-studio-lead="" data-studio-reveal="">
        <p className={styles.eyebrow}>{copy.label}</p>
        <h2 id="studio-title">
          <span>{copy.titleStart}</span> <strong>{copy.titleEmphasis}</strong>
        </h2>
      </div>
      <p className={styles.paragraph} data-studio-reveal="">
        {copy.introduction}
      </p>
      <p className={styles.paragraph} data-studio-reveal="">
        {copy.approach}
      </p>
      <ul className={styles.pillars}>
        {pillars.map((pillar) => (
          <li key={pillar} className={styles.pillar} data-studio-reveal="">
            <PillarIcon pillar={pillar} />
            <div>
              <h3>{copy.pillars[pillar].title}</h3>
              <p>{copy.pillars[pillar].description}</p>
            </div>
          </li>
        ))}
      </ul>
    </StudioReveal>
  );
}

function PillarIcon({ pillar }: { pillar: (typeof pillars)[number] }) {
  if (pillar === 'experience') return <LandingIcon name="simulators" />;
  if (pillar === 'creativity') return <LandingIcon name="games" />;

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="6" y="6" width="20" height="20" rx="3" />
      <rect x="11" y="11" width="10" height="10" rx="1" />
      <path d="M11 2v4m5-4v4m5-4v4M11 26v4m5-4v4m5-4v4M2 11h4m-4 5h4m-4 5h4m20-10h4m-4 5h4m-4 5h4" />
    </svg>
  );
}
