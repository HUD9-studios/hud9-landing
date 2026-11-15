import {
  advancePlayerAnimation,
  createPlayerAnimation,
  type PlayerAnimation,
} from './playerAnimation';

export const sceneWidth = 640;
export const sceneHeight = 550;
export const explosionDuration = 0.46;

const maxShots = 22;
const maxEnemyShots = 2;
const enemyShotInterval = 1.25;
const enemyShotReach = 18;
const shipScale = 0.7875;
const playerMuzzleOffset = 52 * shipScale;
const enemyMuzzleOffset = 22 * shipScale;
const enemyHitbox = { halfWidth: 24 * shipScale, halfHeight: 21 * shipScale };
const playerHull = {
  noseHalfWidth: 16 * shipScale,
  noseTop: -54 * shipScale,
  wingHalfWidth: 50 * shipScale,
  wingTop: -8 * shipScale,
  bottom: 27 * shipScale,
};

export const playerSpriteWidth = 145 * shipScale;

type Point = { x: number; y: number };
type EnemyKind = 'a' | 'b' | 'c' | 'd';
type Enemy = Point & { kind: EnemyKind; index: number; respawnAt: number };
type Shot = Point & {
  vx: number;
  vy: number;
  owner: 'player' | 'enemy';
};
const explosionStyles = {
  enemy: { duration: explosionDuration, size: 128 },
  impact: { duration: 0.28, size: 56 },
} as const;

type Explosion = Point & {
  startedAt: number;
  duration: number;
  size: number;
};

export interface ArcadeScene {
  time: number;
  playerAnimation: PlayerAnimation;
  enemies: Enemy[];
  shots: Shot[];
  explosions: Explosion[];
  nextPlayerShot: number;
  nextEnemyShot: number;
  enemyShooter: number;
}

const formation: (Point & { kind: EnemyKind })[] = [
  { x: 182, y: 103, kind: 'a' },
  { x: 320, y: 58, kind: 'a' },
  { x: 458, y: 103, kind: 'a' },
  { x: 128, y: 174, kind: 'b' },
  { x: 222, y: 174, kind: 'b' },
  { x: 418, y: 174, kind: 'b' },
  { x: 512, y: 174, kind: 'b' },
  { x: 320, y: 222, kind: 'c' },
  { x: 448, y: 248, kind: 'd' },
];

export function enemySpriteWidth(kind: EnemyKind) {
  return (kind === 'c' ? 103 : 90) * shipScale;
}

export function createScene(): ArcadeScene {
  return {
    time: 0,
    playerAnimation: createPlayerAnimation(),
    enemies: formation.map((enemy, index) => ({
      ...enemy,
      index,
      respawnAt: index === 8 ? 2.4 : -1,
    })),
    shots: [
      { x: 285, y: 379, vx: 0, vy: -395, owner: 'player' },
      { x: 317, y: 332, vx: 0, vy: -395, owner: 'player' },
      { x: 167, y: 302, vx: 18, vy: 185, owner: 'enemy' },
    ],
    explosions: [],
    nextPlayerShot: 0.18,
    nextEnemyShot: 0.92,
    enemyShooter: 0,
  };
}

export function playerPosition(time: number): Point {
  return {
    x: 320 + Math.sin(time * 0.67) * 117,
    y: 490 + Math.sin(time * 2) * 6,
  };
}

export function enemyPosition(enemy: Enemy, time: number): Point {
  return {
    x: enemy.x + Math.sin(time * 1.15 + enemy.y * 0.012) * 17,
    y: enemy.y + Math.sin(time * 1.65 + enemy.index * 0.8) * 8,
  };
}

export function stepScene(scene: ArcadeScene, seconds: number) {
  const previousX = playerPosition(scene.time).x;
  scene.time += seconds;
  const player = playerPosition(scene.time);
  if (seconds > 0) {
    advancePlayerAnimation(
      scene.playerAnimation,
      seconds,
      (player.x - previousX) / seconds,
    );
  }
  emitShots(scene, player);
  scene.shots = scene.shots.filter((shot) =>
    advanceShot(scene, shot, seconds, player),
  );
  scene.explosions = scene.explosions.filter(
    ({ startedAt, duration }) => scene.time - startedAt < duration,
  );
}

function emitShots(scene: ArcadeScene, player: Point) {
  if (scene.time >= scene.nextPlayerShot) {
    firePlayer(scene, player);
    scene.nextPlayerShot = scene.time + 0.37;
  }
  if (scene.time >= scene.nextEnemyShot) {
    fireEnemy(scene, player);
    scene.nextEnemyShot = scene.time + enemyShotInterval;
  }
}

function firePlayer(scene: ArcadeScene, player: Point) {
  if (scene.shots.length >= maxShots) return;
  const target = scene.enemies
    .filter((enemy) => enemy.respawnAt <= scene.time)
    .reduce<
      Enemy | undefined
    >((closest, enemy) => (!closest || Math.abs(enemy.x - player.x) < Math.abs(closest.x - player.x) ? enemy : closest), undefined);
  const y = player.y - playerMuzzleOffset;
  const travel = target ? Math.max(0.1, (y - target.y) / 395) : 0.5;
  const goal = target ? enemyPosition(target, scene.time + travel).x : player.x;

  scene.shots.push({
    x: player.x,
    y,
    vx: Math.max(-170, Math.min(170, (goal - player.x) / travel)),
    vy: -395,
    owner: 'player',
  });
}

function fireEnemy(scene: ArcadeScene, player: Point) {
  if (
    scene.shots.length >= maxShots ||
    scene.shots.filter(({ owner }) => owner === 'enemy').length >= maxEnemyShots
  ) {
    return;
  }
  const active = scene.enemies.filter((enemy) => enemy.respawnAt <= scene.time);
  const enemy = active[scene.enemyShooter % active.length];
  scene.enemyShooter += 2;
  if (!enemy) return;

  const { x, y } = enemyPosition(enemy, scene.time);
  scene.shots.push({
    x,
    y: y + enemyMuzzleOffset,
    vx: (player.x - x) * 0.22,
    vy: 185,
    owner: 'enemy',
  });
}

function advanceShot(
  scene: ArcadeScene,
  shot: Shot,
  seconds: number,
  player: Point,
): boolean {
  shot.x += shot.vx * seconds;
  shot.y += shot.vy * seconds;
  if (shot.y < -25 || shot.y > sceneHeight + 25) return false;
  if (shot.owner === 'enemy') return advanceEnemyShot(scene, shot, player);

  for (const enemy of scene.enemies) {
    if (enemy.respawnAt > scene.time) continue;
    const { x, y } = enemyPosition(enemy, scene.time);
    if (
      Math.abs(shot.x - x) > enemyHitbox.halfWidth ||
      Math.abs(shot.y - y) > enemyHitbox.halfHeight
    ) {
      continue;
    }

    enemy.respawnAt = scene.time + 2.1 + (enemy.index % 4) * 0.32;
    addExplosion(scene, { x, y }, 'enemy');
    return false;
  }
  return true;
}

function advanceEnemyShot(scene: ArcadeScene, shot: Shot, player: Point) {
  if (!hitsPlayer(shot, player)) return true;

  addExplosion(
    scene,
    {
      x: shot.x,
      y: Math.min(shot.y + enemyShotReach, player.y + playerHull.bottom),
    },
    'impact',
  );
  return false;
}

function addExplosion(
  scene: ArcadeScene,
  impact: Point,
  kind: keyof typeof explosionStyles,
) {
  if (scene.explosions.length < 8) {
    scene.explosions.push({
      ...impact,
      ...explosionStyles[kind],
      startedAt: scene.time,
    });
  }
}

function hitsPlayer(shot: Shot, player: Point) {
  const horizontalDistance = Math.abs(shot.x - player.x);
  const front = shot.y + enemyShotReach - player.y;
  const back = shot.y - enemyShotReach - player.y;
  if (back > playerHull.bottom) return false;

  // The ship is narrow at the nose and wider around its wings.
  return (
    (horizontalDistance <= playerHull.noseHalfWidth &&
      front >= playerHull.noseTop) ||
    (horizontalDistance <= playerHull.wingHalfWidth &&
      front >= playerHull.wingTop)
  );
}
