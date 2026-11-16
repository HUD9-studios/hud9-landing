// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { mountArcade } from '@/features/landing/studio/arcadeAnimation';
import {
  drawArcade,
  loadSprites,
} from '@/features/landing/studio/arcadeSprites';
import { getPlayerFrame } from '@/features/landing/studio/playerAnimation';

vi.mock('@/features/landing/studio/arcadeSprites', () => ({
  drawArcade: vi.fn(),
  loadSprites: vi.fn(async () => ({})),
}));

let visibility: (entries: { isIntersecting: boolean }[]) => void;
const disconnectVisibility = vi.fn();
const disconnectResize = vi.fn();
const frameRequest = vi.fn<(fn: FrameRequestCallback) => number>();
const cancelFrame = vi.fn();
const motion = Object.assign(new EventTarget(), { matches: false });

beforeEach(() => {
  vi.clearAllMocks();
  motion.matches = false;
  frameRequest.mockReturnValue(42);
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: typeof visibility) {
        visibility = callback;
      }
      observe() {}
      disconnect = disconnectVisibility;
    },
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect = disconnectResize;
    },
  );
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => motion),
  );
  vi.stubGlobal('requestAnimationFrame', frameRequest);
  vi.stubGlobal('cancelAnimationFrame', cancelFrame);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    {} as CanvasRenderingContext2D,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function show() {
  visibility([{ isIntersecting: true }]);
  return vi.waitFor(() => expect(loadSprites).toHaveBeenCalledOnce());
}

function latestPlayerFrame() {
  const scene = vi.mocked(drawArcade).mock.lastCall?.[1];
  if (!scene) throw new Error('The scene has not been painted');
  return getPlayerFrame(scene.playerAnimation);
}

it('preserves the bank on pause and starts at idle on remount', async () => {
  const canvas = document.createElement('canvas');
  const cleanup = mountArcade(canvas);
  await show();
  frameRequest.mock.calls[0][0](100);
  expect(latestPlayerFrame()).toEqual({ group: 'player', index: 0 });
  frameRequest.mock.calls[1][0](140);
  const bank = { group: 'playerRightTransition', index: 0 };
  expect(latestPlayerFrame()).toEqual(bank);

  visibility([{ isIntersecting: false }]);
  visibility([{ isIntersecting: true }]);
  frameRequest.mock.calls[3][0](9000);
  expect(latestPlayerFrame()).toEqual(bank);
  frameRequest.mock.calls[4][0](9045);
  expect(latestPlayerFrame()).toEqual({ ...bank, index: 1 });

  cleanup();
  vi.mocked(loadSprites).mockClear();
  const cleanupRemount = mountArcade(canvas);
  await show();
  frameRequest.mock.lastCall?.[0](10000);
  expect(latestPlayerFrame()).toEqual({ group: 'player', index: 0 });
  cleanupRemount();
});

it('loads once on entry, pauses offscreen, resumes and cleans up', async () => {
  const canvas = document.createElement('canvas');
  const cleanup = mountArcade(canvas);
  expect(loadSprites).not.toHaveBeenCalled();
  await show();
  expect(frameRequest).toHaveBeenCalledOnce();
  frameRequest.mock.calls[0][0](100);
  expect(drawArcade).toHaveBeenCalledOnce();

  visibility([{ isIntersecting: false }]);
  expect(cancelFrame).toHaveBeenCalledWith(42);
  visibility([{ isIntersecting: true }]);
  expect(frameRequest).toHaveBeenCalledTimes(3);
  expect(loadSprites).toHaveBeenCalledOnce();

  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  document.dispatchEvent(new Event('visibilitychange'));
  expect(cancelFrame).toHaveBeenCalledTimes(2);
  hidden.mockReturnValue(false);
  document.dispatchEvent(new Event('visibilitychange'));
  expect(frameRequest).toHaveBeenCalledTimes(4);

  cleanup();
  expect(disconnectVisibility).toHaveBeenCalledOnce();
  expect(disconnectResize).toHaveBeenCalledOnce();
  expect(vi.mocked(loadSprites).mock.calls[0][0].aborted).toBe(true);
});

it('draws a still scene with reduced motion and responds to preference changes', async () => {
  motion.matches = true;
  const cleanup = mountArcade(document.createElement('canvas'));
  await show();
  expect(drawArcade).toHaveBeenCalledOnce();
  expect(frameRequest).not.toHaveBeenCalled();

  motion.matches = false;
  motion.dispatchEvent(new Event('change'));
  expect(frameRequest).toHaveBeenCalledOnce();
  cleanup();
  expect(cancelFrame).toHaveBeenCalledWith(42);
  motion.dispatchEvent(new Event('change'));
  expect(frameRequest).toHaveBeenCalledOnce();
});

it('repaints a visible paused scene on resize without advancing playback', async () => {
  motion.matches = true;
  vi.stubGlobal('devicePixelRatio', 3);
  const canvas = document.createElement('canvas');
  const rect = vi
    .spyOn(canvas, 'getBoundingClientRect')
    .mockReturnValue(new DOMRect(0, 0, 320, 275));
  const cleanup = mountArcade(canvas);
  await show();
  expect([canvas.width, canvas.height]).toEqual([640, 550]);
  const initial = latestPlayerFrame();

  rect.mockReturnValue(new DOMRect(0, 0, 400, 345));
  window.dispatchEvent(new Event('resize'));
  expect([canvas.width, canvas.height]).toEqual([800, 690]);
  expect(drawArcade).toHaveBeenCalledTimes(2);
  expect(latestPlayerFrame()).toEqual(initial);
  expect(frameRequest).not.toHaveBeenCalled();

  cleanup();
  window.dispatchEvent(new Event('resize'));
  expect(drawArcade).toHaveBeenCalledTimes(2);
});
