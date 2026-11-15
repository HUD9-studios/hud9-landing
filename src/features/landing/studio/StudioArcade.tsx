'use client';

import { useEffect, useRef } from 'react';
import { mountArcade } from './arcadeAnimation';
import { sceneHeight, sceneWidth } from './arcadeScene';
import styles from './StudioArcade.module.scss';

export function StudioArcade() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) return mountArcade(ref.current);
  }, []);

  return (
    <canvas
      ref={ref}
      width={sceneWidth}
      height={sceneHeight}
      className={styles.arcade}
      inert
    />
  );
}
