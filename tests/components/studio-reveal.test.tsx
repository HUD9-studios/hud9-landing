// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { StudioReveal } from '@/features/landing/studio/StudioReveal';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('reveals each block only on entry and disconnects on unmount', () => {
  let onVisibility:
    | ((entries: { target: HTMLElement; isIntersecting: boolean }[]) => void)
    | undefined;
  const observe = vi.fn();
  const unobserve = vi.fn();
  const disconnect = vi.fn();
  vi.stubGlobal('CSS', { supports: vi.fn(() => false) });
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false })),
  );
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: typeof onVisibility) {
        onVisibility = callback;
      }
      observe = observe;
      unobserve = unobserve;
      disconnect = disconnect;
    },
  );
  const view = render(
    <StudioReveal className="content">
      <h2 data-studio-lead="" data-studio-reveal="">
        The studio
      </h2>
      <p data-studio-reveal="">Our approach</p>
    </StudioReveal>,
  );
  const title = screen.getByRole('heading', {
    name: 'The studio',
  });
  const approach = screen.getByText('Our approach');
  expect(observe.mock.calls).toEqual([[title], [approach]]);
  expect(title.dataset.studioReveal).toBe('');
  expect(approach.dataset.studioReveal).toBe('');

  onVisibility?.([
    { target: title, isIntersecting: true },
    { target: approach, isIntersecting: false },
  ]);
  expect(title.dataset.studioReveal).toBe('shown');
  expect(approach.dataset.studioReveal).toBe('waiting');
  expect(unobserve.mock.calls).toEqual([[title]]);

  onVisibility?.([{ target: approach, isIntersecting: true }]);
  expect(approach.dataset.studioReveal).toBe('shown');
  expect(unobserve.mock.calls).toEqual([[title], [approach]]);

  onVisibility?.([{ target: title, isIntersecting: false }]);
  expect(title.dataset.studioReveal).toBe('shown');

  view.unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});

it('keeps the title on the observer and leaves the other blocks to the scroll timeline', () => {
  const observe = vi.fn();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false })),
  );
  vi.stubGlobal('CSS', { supports: vi.fn(() => true) });
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = observe;
      disconnect() {}
    },
  );
  render(
    <StudioReveal className="content">
      <h2 data-studio-lead="" data-studio-reveal="">
        The studio
      </h2>
      <p data-studio-reveal="">Our approach</p>
    </StudioReveal>,
  );

  expect(observe.mock.calls).toEqual([[screen.getByRole('heading')]]);
  expect(screen.getByText('Our approach').dataset.studioReveal).toBe('');
});

it('keeps copy directly visible with reduced motion', () => {
  const observer = vi.fn();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true })),
  );
  vi.stubGlobal('IntersectionObserver', observer);
  render(
    <StudioReveal className="content">
      <p data-studio-reveal="">El estudio</p>
    </StudioReveal>,
  );
  expect(screen.getByText('El estudio').dataset.studioReveal).toBe('');
  expect(observer).not.toHaveBeenCalled();
});
