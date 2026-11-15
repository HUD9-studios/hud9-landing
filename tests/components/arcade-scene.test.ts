import { expect, it } from 'vitest';
import {
  createScene,
  enemyPosition,
  explosionDuration,
  playerPosition,
  stepScene,
} from '@/features/landing/studio/arcadeScene';

it('moves the formation and caps projectiles while both sides fire', () => {
  const scene = createScene();
  const enemy = scene.enemies[0];
  const start = enemyPosition(enemy, scene.time);
  for (let i = 0; i < 30; i += 1) stepScene(scene, 0.02);
  expect(enemyPosition(enemy, scene.time)).not.toEqual(start);
  expect(
    scene.shots.filter(({ owner }) => owner === 'player').length,
  ).toBeGreaterThan(2);
  expect(scene.shots.filter(({ owner }) => owner === 'enemy').length).toBe(1);

  for (let i = 0; i < 20; i += 1) stepScene(scene, 0.02);
  expect(scene.shots.filter(({ owner }) => owner === 'enemy')).toHaveLength(2);

  let maximum = 0;
  let maximumEnemyShots = 0;
  for (let i = 0; i < 1500; i += 1) {
    stepScene(scene, 0.02);
    maximum = Math.max(maximum, scene.shots.length);
    maximumEnemyShots = Math.max(
      maximumEnemyShots,
      scene.shots.filter(({ owner }) => owner === 'enemy').length,
    );
  }
  expect(maximum).toBeLessThanOrEqual(22);
  expect(maximumEnemyShots).toBe(2);
});

it('creates a small explosion at each hit and lets near misses continue', () => {
  const scene = createScene();
  const player = playerPosition(0.05);
  scene.nextEnemyShot = Infinity;
  scene.nextPlayerShot = Infinity;
  scene.shots = [
    { x: player.x, y: player.y - 65, vx: 0, vy: 185, owner: 'enemy' },
    { x: player.x + 39, y: player.y - 32, vx: 0, vy: 185, owner: 'enemy' },
    { x: player.x + 45, y: player.y, vx: 0, vy: 185, owner: 'enemy' },
  ];

  stepScene(scene, 0.05);
  expect(scene.shots).toMatchObject([
    { x: player.x + 45, y: player.y + 9.25, owner: 'enemy' },
  ]);
  expect(scene.explosions).toMatchObject([
    { x: player.x, size: 56, duration: 0.28, startedAt: scene.time },
    { x: player.x + 39, size: 56, duration: 0.28, startedAt: scene.time },
  ]);
  stepScene(scene, 0.29);
  expect(scene.explosions).toHaveLength(0);
});

it('removes a hit enemy, expires the explosion and respawns the enemy', () => {
  const scene = createScene();
  const enemy = scene.enemies[0];
  const point = enemyPosition(enemy, 0.02);
  scene.nextPlayerShot = Infinity;
  scene.nextEnemyShot = Infinity;
  scene.shots = [
    { ...point, x: point.x + 20, vx: 0, vy: 0, owner: 'player' },
    { ...point, y: point.y + 16, vx: 0, vy: 0, owner: 'player' },
  ];

  stepScene(scene, 0.02);
  expect(scene.shots).toHaveLength(1);
  expect(scene.shots[0].x).toBe(point.x + 20);
  scene.shots = [];
  expect(scene.explosions).toEqual([
    { ...point, size: 128, duration: explosionDuration, startedAt: scene.time },
  ]);
  expect(enemy.respawnAt).toBeGreaterThan(scene.time);

  stepScene(scene, explosionDuration + 0.01);
  expect(scene.explosions).toHaveLength(0);
  expect(enemy.respawnAt).toBeGreaterThan(scene.time);

  stepScene(scene, 2);
  expect(enemy.respawnAt).toBeLessThan(scene.time);
});

it('fires from the original ship centers with scaled muzzle offsets', () => {
  const scene = createScene();
  const player = playerPosition(0);
  const enemy = enemyPosition(scene.enemies[0], 0);
  scene.shots = [];
  scene.nextPlayerShot = 0;
  scene.nextEnemyShot = 0;

  stepScene(scene, 0);

  expect(scene.shots).toMatchObject([
    { owner: 'player', x: player.x, y: player.y - 40.95 },
    { owner: 'enemy', x: enemy.x, y: enemy.y + 17.325 },
  ]);
});
