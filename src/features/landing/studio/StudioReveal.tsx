'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function StudioReveal({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = ref.current;
    if (
      !content ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const blocks = content.querySelectorAll(
      supportsScrollReveal() ? '[data-studio-lead]' : '[data-studio-reveal]',
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (
            !(target instanceof HTMLElement) ||
            target.dataset.studioReveal === 'shown'
          ) {
            continue;
          }
          target.dataset.studioReveal = isIntersecting ? 'shown' : 'waiting';
          if (isIntersecting) observer.unobserve(target);
        }
      },
      { rootMargin: '0px 0px -6% 0px' },
    );
    for (const block of blocks) observer.observe(block);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

function supportsScrollReveal() {
  return (
    window.CSS?.supports('animation-timeline', 'view()') &&
    window.CSS?.supports('animation-range', 'entry 0% entry 100%')
  );
}
