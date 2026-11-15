import type { ReactNode } from 'react';
import styles from './PageContainer.module.scss';

export function PageContainer({
  children,
  className = styles.container,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <main id={id} className={className} tabIndex={-1}>
      {children}
    </main>
  );
}
