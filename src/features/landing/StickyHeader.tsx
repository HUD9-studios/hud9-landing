'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

export type HeaderSection = 'home' | 'studio' | 'contact';

const HeaderSectionContext = createContext<HeaderSection>('home');

export function useHeaderSection() {
  return useContext(HeaderSectionContext);
}

export function StickyHeader({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const active = useTrackHeaderSection(ref);

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
      <HeaderSectionContext.Provider value={active}>
        {children}
      </HeaderSectionContext.Provider>
    </header>
  );
}

function useTrackHeaderSection(ref: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState<HeaderSection>('home');

  useEffect(() => {
    const studio = document.getElementById('studio');
    const contact = document.getElementById('contact');
    const header = ref.current;
    if (!studio || !contact || !header) return;

    let pendingFrame: number | undefined;
    let previous: HeaderSection | undefined;
    const update = () => {
      pendingFrame = undefined;
      const current = getHeaderSection(header, studio, contact);
      if (current !== previous) {
        previous = current;
        setActive(current);
      }
    };
    const schedule = () => {
      pendingFrame ??= window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    return () => {
      if (pendingFrame !== undefined) window.cancelAnimationFrame(pendingFrame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, [ref]);

  return active;
}

function getHeaderSection(
  header: HTMLElement,
  studio: HTMLElement,
  contact: HTMLElement,
): HeaderSection {
  const marker = header.getBoundingClientRect().bottom + 24;
  const contactTop = contact.getBoundingClientRect().top;
  const viewportHeight = window.innerHeight;
  const contactAtPageEnd =
    window.scrollY > 0 &&
    window.scrollY + viewportHeight >=
      document.documentElement.scrollHeight - 1 &&
    contactTop < viewportHeight;

  if (contactTop <= marker || contactAtPageEnd) return 'contact';
  return studio.getBoundingClientRect().top <= marker ? 'studio' : 'home';
}
