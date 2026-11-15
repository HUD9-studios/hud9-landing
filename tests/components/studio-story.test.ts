// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import {
  getStudioProgress,
  getStudioReveal,
  mountStudioStory,
} from '@/features/landing/studio/studioScroll';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('keeps the title-only interval, stages the copy and completes before release', () => {
  expect(getStudioProgress(100, 800)).toBe(0);
  expect(getStudioProgress(-100, 0)).toBe(0);
  expect(getStudioProgress(-900, 800)).toBe(1);
  expect(getStudioReveal(0.2)).toEqual([0, 0, 0, 0, 0]);
  expect(getStudioReveal(0.3)[0]).toBeCloseTo(0.5);
  expect(getStudioReveal(0.5)).toEqual([1, 0.5, 0, 0, 0]);
  expect(getStudioReveal(0.69)[3]).toBeGreaterThan(0);
  expect(getStudioReveal(0.69)[4]).toBe(0);
  expect(getStudioReveal(0.85)).toEqual([1, 1, 1, 1, 1]);
});

function setupStory() {
  const story = document.createElement('section');
  const frame = document.createElement('div');
  const layout = document.createElement('div');
  const blocks = Array.from({ length: 5 }, () => {
    const block = document.createElement('p');
    block.setAttribute('data-studio-reveal', '');
    return block;
  });
  layout.append(...blocks);
  frame.append(layout);
  story.append(frame);
  document.body.append(story);
  frame.style.paddingBlockStart = '90px';
  frame.style.paddingBlockEnd = '50px';
  Object.defineProperty(layout, 'offsetHeight', { value: 500 });
  let top = 0;
  vi.spyOn(story, 'getBoundingClientRect').mockImplementation(
    () => new DOMRect(0, top, 1400, 1700),
  );
  vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 1400, 900),
  );

  const motion = Object.assign(new EventTarget(), { matches: false });
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => motion),
  );
  vi.stubGlobal('visualViewport', undefined);
  vi.stubGlobal('innerHeight', 900);
  const requestFrame = vi.fn<(callback: FrameRequestCallback) => number>();
  requestFrame.mockReturnValue(7);
  vi.stubGlobal('requestAnimationFrame', requestFrame);
  vi.stubGlobal('cancelAnimationFrame', vi.fn());

  return {
    story,
    frame,
    layout,
    motion,
    requestFrame,
    scroll(position: number) {
      top = -position * 800;
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
      requestFrame.mock.lastCall?.[0](0);
    },
    opacity: () =>
      blocks.map((block) =>
        Number(block.style.getPropertyValue('--studio-scroll-reveal')),
      ),
  };
}

it('batches native scroll updates and reverses the sequence', () => {
  const page = setupStory();
  const cleanup = mountStudioStory(page.story, page.frame, page.layout);
  expect(page.story.hasAttribute('data-studio-pinned')).toBe(true);
  expect(page.opacity()).toEqual([0, 0, 0, 0, 0]);

  page.scroll(0.52);
  expect(page.requestFrame).toHaveBeenCalledOnce();
  expect(page.opacity()[0]).toBe(1);
  expect(page.opacity()[1]).toBeGreaterThan(0);

  page.scroll(0.1);
  expect(page.opacity()).toEqual([0, 0, 0, 0, 0]);
  cleanup();
  expect(page.story.hasAttribute('data-studio-pinned')).toBe(false);
});

it('uses the natural flow when the content cannot fit or motion is reduced', () => {
  const page = setupStory();
  const cleanup = mountStudioStory(page.story, page.frame, page.layout);
  vi.stubGlobal('innerHeight', 480);
  window.dispatchEvent(new Event('resize'));
  expect(page.story.hasAttribute('data-studio-pinned')).toBe(false);
  page.scroll(0.4);
  expect(page.requestFrame).not.toHaveBeenCalled();

  vi.stubGlobal('innerHeight', 900);
  window.dispatchEvent(new Event('resize'));
  expect(page.story.hasAttribute('data-studio-pinned')).toBe(true);
  page.motion.matches = true;
  page.motion.dispatchEvent(new Event('change'));
  expect(page.story.hasAttribute('data-studio-pinned')).toBe(false);
  cleanup();
});
