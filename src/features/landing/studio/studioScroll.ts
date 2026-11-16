const phases = [
  [0.2, 0.4],
  [0.4, 0.6],
  [0.6, 0.7],
  [0.67, 0.77],
  [0.74, 0.85],
] as const;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function getStudioProgress(top: number, travel: number) {
  return travel > 0 ? clamp(-top / travel) : 0;
}

export function getStudioReveal(progress: number) {
  return phases.map(([start, end]) => {
    const step = clamp((progress - start) / (end - start));
    return step * step * (3 - 2 * step);
  });
}

export function mountStudioStory(
  story: HTMLElement,
  frame: HTMLElement,
  layout: HTMLElement,
): () => void {
  if (typeof window.matchMedia !== 'function') return () => {};

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const landscape = window.matchMedia('(orientation: landscape)');
  const viewport = window.visualViewport;
  const header = story.closest('#home')?.querySelector('header');
  const updateProgress = trackProgress(story, frame);
  let pinned = false;
  let pendingFrame: number | undefined;

  function update() {
    pendingFrame = undefined;
    if (pinned) updateProgress();
  }

  function onScroll() {
    if (pinned) pendingFrame ??= window.requestAnimationFrame(update);
  }

  function measure() {
    pinned =
      landscape.matches &&
      !motion.matches &&
      fitsViewport(frame, layout, header, viewport?.height);
    story.toggleAttribute('data-studio-pinned', pinned);
    if (pinned) updateProgress();
  }

  measure();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  viewport?.addEventListener('resize', measure);
  motion.addEventListener('change', measure);
  landscape.addEventListener('change', measure);
  const resize =
    'ResizeObserver' in window ? new ResizeObserver(measure) : undefined;
  resize?.observe(layout);

  return () => {
    if (pendingFrame !== undefined) window.cancelAnimationFrame(pendingFrame);
    resize?.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', measure);
    viewport?.removeEventListener('resize', measure);
    motion.removeEventListener('change', measure);
    landscape.removeEventListener('change', measure);
    story.removeAttribute('data-studio-pinned');
  };
}

function fitsViewport(
  frame: HTMLElement,
  layout: HTMLElement,
  header: HTMLElement | null | undefined,
  visualHeight: number | undefined,
) {
  const style = getComputedStyle(frame);
  const top = Math.max(
    Number.parseFloat(style.paddingBlockStart) || 0,
    header?.offsetHeight ?? 0,
  );
  const bottom = Number.parseFloat(style.paddingBlockEnd) || 0;
  const viewportHeight = Math.min(window.innerHeight, visualHeight ?? Infinity);
  return (
    layout.offsetHeight > 0 &&
    layout.offsetHeight + top + bottom + 1 <= viewportHeight
  );
}

function trackProgress(story: HTMLElement, frame: HTMLElement) {
  const blocks = story.querySelectorAll<HTMLElement>(
    '[data-studio-reveal]:not([data-studio-lead])',
  );
  let lastProgress: number | undefined;

  return () => {
    const { top, height } = story.getBoundingClientRect();
    const travel = height - frame.getBoundingClientRect().height;
    const progress = getStudioProgress(top, travel);
    if (lastProgress === progress) return;

    lastProgress = progress;
    const reveals = getStudioReveal(progress);
    for (const [index, block] of blocks.entries()) {
      block.style.setProperty('--studio-scroll-reveal', String(reveals[index]));
    }
  };
}
