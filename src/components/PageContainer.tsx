import type { ReactNode } from 'react';
import styles from './PageContainer.module.scss';

export function PageContainer({ children }: { children: ReactNode }) {
  return <main className={styles.container}>{children}</main>;
}
