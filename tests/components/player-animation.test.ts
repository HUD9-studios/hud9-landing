import { expect, it } from 'vitest';
import {
  advancePlayerAnimation,
  createPlayerAnimation,
  getPlayerFrame,
} from '@/features/landing/studio/playerAnimation';

it('cycles through all four idle frames with no horizontal movement', () => {
  const animation = createPlayerAnimation();
  for (const index of [0, 1, 2, 3, 0]) {
    expect(getPlayerFrame(animation)).toEqual({ group: 'player', index });
    advancePlayerAnimation(animation, 0.121, 0);
  }
  advancePlayerAnimation(animation, 0.04, 5);
  expect(getPlayerFrame(animation).group).toBe('player');
});

it.each([
  { direction: 'Left', speed: -40 },
  { direction: 'Right', speed: 40 },
])(
  'banks $direction, loops all three frames, and returns to center',
  ({ direction, speed }) => {
    const animation = createPlayerAnimation();
    const moving = `player${direction}`;
    const transition = `${moving}Transition`;
    advancePlayerAnimation(animation, 0.01, speed);
    expect(getPlayerFrame(animation)).toEqual({ group: transition, index: 0 });
    advancePlayerAnimation(animation, 0.08, speed);
    expect(getPlayerFrame(animation)).toEqual({ group: transition, index: 1 });
    advancePlayerAnimation(animation, 0.08, speed);
    for (const index of [0, 1, 2, 0]) {
      expect(getPlayerFrame(animation)).toEqual({ group: moving, index });
      advancePlayerAnimation(animation, 0.12, speed);
    }

    advancePlayerAnimation(animation, 0.01, 0);
    expect(getPlayerFrame(animation)).toEqual({ group: transition, index: 1 });
    advancePlayerAnimation(animation, 0.08, 0);
    expect(getPlayerFrame(animation)).toEqual({ group: transition, index: 0 });
    advancePlayerAnimation(animation, 0.08, 0);
    expect(getPlayerFrame(animation)).toEqual({ group: 'player', index: 0 });
  },
);

it('passes through center on an immediate reversal', () => {
  const animation = createPlayerAnimation();
  advancePlayerAnimation(animation, 0.18, -40);
  advancePlayerAnimation(animation, 0.01, 40);
  expect(getPlayerFrame(animation)).toEqual({
    group: 'playerLeftTransition',
    index: 1,
  });
  for (const [group, index] of [
    ['playerLeftTransition', 0],
    ['player', 0],
    ['playerRightTransition', 0],
    ['playerRightTransition', 1],
    ['playerRight', 0],
  ] as const) {
    advancePlayerAnimation(animation, 0.08, 40);
    expect(getPlayerFrame(animation)).toEqual({ group, index });
  }
});

it('allows a reversal before the first bank finishes', () => {
  const animation = createPlayerAnimation();
  advancePlayerAnimation(animation, 0.02, -40);
  advancePlayerAnimation(animation, 0.02, 40);
  expect(getPlayerFrame(animation).group).toBe('playerLeftTransition');
  advancePlayerAnimation(animation, 0.05, 40);
  expect(getPlayerFrame(animation).group).toBe('player');
  advancePlayerAnimation(animation, 0.08, 40);
  expect(getPlayerFrame(animation).group).toBe('playerRightTransition');
});

it('uses elapsed time for the bank and exhaust cycle at different frame rates', () => {
  const states = [24, 60, 144].map((frames) => {
    const animation = createPlayerAnimation();
    for (let frame = 0; frame < frames; frame++) {
      advancePlayerAnimation(animation, 1.03 / frames, 40);
    }
    return getPlayerFrame(animation);
  });
  expect(states).toEqual([
    { group: 'playerRight', index: 1 },
    { group: 'playerRight', index: 1 },
    { group: 'playerRight', index: 1 },
  ]);
});
