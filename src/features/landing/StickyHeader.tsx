'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function StickyHeader({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;

    const updateCompactState = () => {
      header.toggleAttribute('data-compact', window.scrollY > 24);
    };

    updateCompactState();
    window.addEventListener('scroll', updateCompactState, { passive: true });
    return () => window.removeEventListener('scroll', updateCompactState);
  }, []);

  return (
    <header ref={ref} className={className}>
      {children}
    </header>
  );
}
