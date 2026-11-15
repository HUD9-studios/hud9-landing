import { createScene, stepScene } from './arcadeScene';
import { drawArcade, loadSprites, type SpriteLibrary } from './arcadeSprites';

export function mountArcade(canvas: HTMLCanvasElement): () => void {
  const context = canvas.getContext('2d');
  if (!context) return () => {};

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const playback = createPlayback(context);
  const loading = new AbortController();
  let visible = false;
  let requested = false;
  let ready = false;

  function update() {
    if (!visible || document.hidden) {
      playback.pause();
      return;
    }
    if (!requested) {
      requested = true;
      void loadSprites(loading.signal).then((sprites) => {
        if (loading.signal.aborted) return;
        ready = true;
        playback.setSprites(sprites);
        update();
      });
    }
    if (!ready) return;
    if (motion.matches) {
      playback.pause();
      playback.paint();
    } else {
      playback.play();
    }
  }

  const stopObserving = observeVisibility(canvas, (isVisible) => {
    visible = isVisible;
    update();
  });
  const stopResizing = observeSize(canvas, () => {
    if (visible && !document.hidden) playback.paint();
  });
  motion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);

  return () => {
    loading.abort();
    playback.pause();
    stopObserving();
    stopResizing();
    motion.removeEventListener('change', update);
    document.removeEventListener('visibilitychange', update);
  };
}

function createPlayback(context: CanvasRenderingContext2D) {
  const scene = createScene();
  let sprites: SpriteLibrary | undefined;
  let frameId: number | undefined;
  let lastFrame: number | undefined;

  function paint() {
    if (sprites) drawArcade(context, scene, sprites);
  }

  function tick(timestamp: number) {
    if (lastFrame !== undefined) {
      stepScene(scene, Math.min((timestamp - lastFrame) / 1000, 0.05));
    }
    lastFrame = timestamp;
    paint();
    frameId = window.requestAnimationFrame(tick);
  }

  return {
    setSprites: (loaded: SpriteLibrary) => {
      sprites = loaded;
    },
    paint,
    play() {
      frameId ??= window.requestAnimationFrame(tick);
    },
    pause() {
      if (frameId !== undefined) window.cancelAnimationFrame(frameId);
      frameId = undefined;
      lastFrame = undefined;
    },
  };
}

function observeVisibility(
  canvas: HTMLCanvasElement,
  update: (visible: boolean) => void,
) {
  if (!('IntersectionObserver' in window)) {
    update(true);
    return () => {};
  }

  const observer = new IntersectionObserver(([entry]) => {
    update(Boolean(entry?.isIntersecting));
  });
  observer.observe(canvas);
  return () => observer.disconnect();
}

function observeSize(canvas: HTMLCanvasElement, repaint: () => void) {
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    repaint();
  }

  const observer =
    'ResizeObserver' in window ? new ResizeObserver(resize) : undefined;
  observer?.observe(canvas);
  window.addEventListener('resize', resize);
  resize();

  return () => {
    observer?.disconnect();
    window.removeEventListener('resize', resize);
  };
}
