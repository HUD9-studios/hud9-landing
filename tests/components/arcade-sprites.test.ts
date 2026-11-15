import { afterEach, expect, it, vi } from 'vitest';
import {
  createScene,
  enemyPosition,
} from '@/features/landing/studio/arcadeScene';
import {
  drawArcade,
  loadSprites,
} from '@/features/landing/studio/arcadeSprites';

afterEach(() => vi.unstubAllGlobals());

class TestImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 160;
  naturalHeight = 160;
  removeAttribute = vi.fn();

  set src(url: string) {
    if (url.includes('/projectiles/')) {
      this.naturalWidth = 64;
      this.naturalHeight = 112;
    }
    queueMicrotask(() => {
      if (url.includes('player_01') || url.includes('/explosions/')) {
        this.onerror?.();
      } else {
        this.onload?.();
      }
    });
  }
}

function createCanvasMock() {
  return {
    canvas: { width: 1280, height: 1100 },
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
  };
}

it('renders the larger ships around their original centers', async () => {
  vi.stubGlobal('Image', TestImage);
  const sprites = await loadSprites(new AbortController().signal);
  const scene = createScene();
  for (const enemy of scene.enemies) enemy.respawnAt = -1;
  const canvas = createCanvasMock();
  const context = canvas as unknown as CanvasRenderingContext2D;

  drawArcade(context, scene, sprites);
  expect(canvas.setTransform).toHaveBeenLastCalledWith(2, 0, 0, 2, 0, 0);
  expect(canvas.drawImage).toHaveBeenCalledWith(
    sprites.shotPlayer[0],
    269,
    351,
    32,
    56,
  );
  for (const enemy of scene.enemies) {
    const width = enemy.kind === 'c' ? 81.1125 : 70.875;
    const { x, y } = enemyPosition(enemy, 0);
    expect(canvas.drawImage).toHaveBeenCalledWith(
      sprites[enemy.kind][enemy.index % 2],
      x - width / 2,
      y - width / 2,
      width,
      width,
    );
  }
  expect(canvas.drawImage).toHaveBeenLastCalledWith(
    sprites.player[0],
    262.90625,
    432.90625,
    114.1875,
    114.1875,
  );
});

it('rotates only the enemy projectile by half a turn around its center', async () => {
  vi.stubGlobal('Image', TestImage);
  const sprites = await loadSprites(new AbortController().signal);
  const scene = createScene();
  const canvas = createCanvasMock();

  drawArcade(canvas as unknown as CanvasRenderingContext2D, scene, sprites);

  expect(
    canvas.rotate.mock.calls.filter(([angle]) => angle === Math.PI),
  ).toHaveLength(1);
  expect(canvas.translate).toHaveBeenLastCalledWith(167, 302);
  expect(canvas.drawImage).toHaveBeenCalledWith(
    sprites.shotEnemy[0],
    -16,
    -28,
    32,
    56,
  );
  const projectileIndex = canvas.drawImage.mock.calls.findIndex(
    ([image]) => image === sprites.shotEnemy[0],
  );
  const projectileDraw =
    canvas.drawImage.mock.invocationCallOrder[projectileIndex];
  expect(canvas.rotate.mock.invocationCallOrder.at(-1)).toBeLessThan(
    projectileDraw,
  );
  expect(canvas.restore.mock.invocationCallOrder.at(-1)).toBeGreaterThan(
    projectileDraw,
  );
});

it('draws the impact at its original size above the ship', async () => {
  vi.stubGlobal('Image', TestImage);
  const sprites = await loadSprites(new AbortController().signal);
  const scene = createScene();
  scene.explosions.push({
    x: 320,
    y: 440,
    startedAt: 0,
    duration: 0.28,
    size: 56,
  });
  const canvas = createCanvasMock();
  sprites.explosion = [sprites.player[1]];
  drawArcade(canvas as unknown as CanvasRenderingContext2D, scene, sprites);
  expect(canvas.drawImage).toHaveBeenLastCalledWith(
    sprites.explosion[0],
    292,
    412,
    56,
    56,
  );
});

it('loads the two distinct enemy B animation frames', async () => {
  const requested: string[] = [];
  vi.stubGlobal(
    'Image',
    class extends TestImage {
      set src(url: string) {
        requested.push(url);
        super.src = url;
      }
    },
  );
  const sprites = await loadSprites(new AbortController().signal);
  expect(sprites.b).toHaveLength(2);
  expect(sprites.b[0]).not.toBe(sprites.b[1]);
  expect(requested.filter((url) => url.includes('/enemies/enemy_b_'))).toEqual([
    '/images/studio/assets/arcade/enemies/enemy_b_01.png',
    '/images/studio/assets/arcade/enemies/enemy_b_02.png',
  ]);
});

it('keeps valid frames when individual resources or an entire group fail', async () => {
  vi.stubGlobal('Image', TestImage);
  const sprites = await loadSprites(new AbortController().signal);
  expect(sprites.player).toHaveLength(3);
  expect(sprites.playerLeftTransition).toHaveLength(2);
  expect(sprites.playerLeft).toHaveLength(3);
  expect(sprites.playerRightTransition).toHaveLength(2);
  expect(sprites.playerRight).toHaveLength(3);
  expect(sprites.explosion).toHaveLength(0);
  expect(sprites.asteroids).toHaveLength(3);
  expect(sprites.player.every((image) => image.onload === null)).toBe(true);
});

it('settles pending sprites on unmount instead of waiting for network events', async () => {
  const pending: TestImage[] = [];
  vi.stubGlobal(
    'Image',
    class extends TestImage {
      constructor() {
        super();
        pending.push(this);
      }
    },
  );
  const controller = new AbortController();
  const result = loadSprites(controller.signal);
  controller.abort();

  expect(Object.values(await result).flat()).toHaveLength(0);
  expect(pending.length).toBeGreaterThan(0);
  expect(
    pending.every((image) => image.removeAttribute.mock.calls.length === 1),
  ).toBe(true);
  expect(
    pending.every((image) => image.onload === null && image.onerror === null),
  ).toBe(true);
});
