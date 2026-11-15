import {
  type ArcadeScene,
  enemyPosition,
  enemySpriteWidth,
  playerPosition,
  playerSpriteWidth,
  sceneHeight,
  sceneWidth,
} from './arcadeScene';
import { getPlayerFrame } from './playerAnimation';

const root = '/images/studio/assets/arcade/';

const sprites = {
  player: [
    'player/player_01.png',
    'player/player_02.png',
    'player/player_03.png',
    'player/player_04.png',
  ],
  playerLeftTransition: [
    'player/yaw/player_left_transition_01.png',
    'player/yaw/player_left_transition_02.png',
  ],
  playerLeft: [
    'player/yaw/player_left_01.png',
    'player/yaw/player_left_02.png',
    'player/yaw/player_left_03.png',
  ],
  playerRightTransition: [
    'player/yaw/player_right_transition_01.png',
    'player/yaw/player_right_transition_02.png',
  ],
  playerRight: [
    'player/yaw/player_right_01.png',
    'player/yaw/player_right_02.png',
    'player/yaw/player_right_03.png',
  ],
  a: ['enemies/enemy_a_01.png', 'enemies/enemy_a_02.png'],
  // Hold the complete frame in both positions until enemy_b_02.png is replaced.
  b: ['enemies/enemy_b_01.png', 'enemies/enemy_b_02.png'],
  c: ['enemies/enemy_c_01.png', 'enemies/enemy_c_02.png'],
  d: ['enemies/enemy_d_01.png', 'enemies/enemy_d_02.png'],
  shotPlayer: [
    'projectiles/shot_player_01.png',
    'projectiles/shot_player_02.png',
  ],
  shotEnemy: [
    'projectiles/shot_enemy_red_01.png',
    'projectiles/shot_enemy_red_02.png',
  ],
  explosion: [
    'explosions/explosion_01.png',
    'explosions/explosion_02.png',
    'explosions/explosion_03.png',
    'explosions/explosion_04.png',
    'explosions/explosion_05.png',
  ],
  asteroids: [
    'asteroids/asteroid_02.png',
    'asteroids/asteroid_01.png',
    'asteroids/asteroid_03.png',
  ],
};

type SpriteName = keyof typeof sprites;
export type SpriteLibrary = Record<SpriteName, HTMLImageElement[]>;

export async function loadSprites(signal: AbortSignal): Promise<SpriteLibrary> {
  const requests = new Map<string, Promise<HTMLImageElement | undefined>>();
  const load = (path: string) => {
    const existing = requests.get(path);
    if (existing) return existing;
    const request = loadSprite(path, signal);
    requests.set(path, request);
    return request;
  };
  const groups = await Promise.all(
    Object.entries(sprites).map(async ([group, paths]) => {
      const frames = (await Promise.all(paths.map(load))).filter(
        (image) => image !== undefined,
      );
      return [group, frames] as const;
    }),
  );
  return Object.fromEntries(groups) as SpriteLibrary;
}

function loadSprite(
  path: string,
  signal: AbortSignal,
): Promise<HTMLImageElement | undefined> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve(undefined);
      return;
    }

    const image = new Image();
    const finish = (result?: HTMLImageElement) => {
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener('abort', cancel);
      resolve(result);
    };
    const cancel = () => {
      finish();
      image.removeAttribute('src');
    };

    image.onload = () => finish(image);
    image.onerror = () => finish();
    signal.addEventListener('abort', cancel, { once: true });
    image.src = root + path;
  });
}

const rocks = [
  { x: 52, y: 316, size: 126, drift: 0.25 },
  { x: 146, y: 411, size: 92, drift: -0.18 },
  { x: 548, y: 495, size: 100, drift: 0.16 },
];

export function drawArcade(
  context: CanvasRenderingContext2D,
  scene: ArcadeScene,
  library: SpriteLibrary,
) {
  const { width, height } = context.canvas;
  const scale = Math.min(width / sceneWidth, height / sceneHeight);
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, width, height);
  context.setTransform(
    scale,
    0,
    0,
    scale,
    (width - sceneWidth * scale) / 2,
    (height - sceneHeight * scale) / 2,
  );

  drawRocks(context, scene.time, library.asteroids);
  drawShots(context, scene, library);

  for (const enemy of scene.enemies) {
    if (enemy.respawnAt > scene.time) continue;
    context.globalAlpha = Math.min(1, (scene.time - enemy.respawnAt) / 0.48);
    const frames = library[enemy.kind];
    paint(
      context,
      frame(frames, scene.time * 5 + (enemy.index % 2)),
      enemyPosition(enemy, scene.time),
      enemySpriteWidth(enemy.kind),
    );
  }
  context.globalAlpha = 1;

  const playerFrame = getPlayerFrame(scene.playerAnimation);
  const playerSprite =
    frame(library[playerFrame.group], playerFrame.index) ??
    frame(library.player, scene.time * 9);
  paint(context, playerSprite, playerPosition(scene.time), playerSpriteWidth);

  for (const explosion of scene.explosions) {
    const progress = (scene.time - explosion.startedAt) / explosion.duration;
    const frames = library.explosion;
    paint(
      context,
      frames[Math.floor(progress * frames.length)],
      explosion,
      explosion.size,
    );
  }
}

function frame(frames: HTMLImageElement[], tick: number) {
  return frames.length ? frames[Math.floor(tick) % frames.length] : undefined;
}

function drawShots(
  context: CanvasRenderingContext2D,
  { shots, time }: ArcadeScene,
  { shotPlayer, shotEnemy }: SpriteLibrary,
) {
  const tick = time * 11;
  for (const shot of shots) {
    if (shot.owner === 'player') {
      paint(context, frame(shotPlayer, tick), shot, 32);
      continue;
    }

    context.save();
    context.translate(shot.x, shot.y);
    context.rotate(Math.PI);
    paint(context, frame(shotEnemy, tick), { x: 0, y: 0 }, 32);
    context.restore();
  }
}

function drawRocks(
  context: CanvasRenderingContext2D,
  time: number,
  frames: HTMLImageElement[],
) {
  for (const [index, rock] of rocks.entries()) {
    context.save();
    context.globalAlpha = 0.76;
    context.translate(
      rock.x + Math.sin(time * rock.drift + index) * 11,
      rock.y + Math.sin(time * 0.35 + index * 1.4) * 13,
    );
    context.rotate(Math.sin(time * rock.drift + index) * 0.53);
    paint(context, frames[index] ?? frames[0], { x: 0, y: 0 }, rock.size);
    context.restore();
  }
}

function paint(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  { x, y }: { x: number; y: number },
  width: number,
) {
  if (!image?.naturalWidth) return;
  const height = (width * image.naturalHeight) / image.naturalWidth;
  context.drawImage(image, x - width / 2, y - height / 2, width, height);
}
