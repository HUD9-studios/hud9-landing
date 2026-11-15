'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from '../StudioSection.module.scss';
import { mountStudioStory } from './studioScroll';

export function StudioStory({ children }: { children: ReactNode }) {
  const story = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const layout = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (story.current && frame.current && layout.current) {
      return mountStudioStory(story.current, frame.current, layout.current);
    }
  }, []);

  return (
    <section
      ref={story}
      className={styles.story}
      id="studio"
      aria-labelledby="studio-title"
      tabIndex={-1}
    >
      <div ref={frame} className={styles.studio}>
        <div ref={layout} className={styles.layout}>
          {children}
        </div>
      </div>
    </section>
  );
}
