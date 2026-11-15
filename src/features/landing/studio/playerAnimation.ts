const frameDuration = 0.12;
const transitionDuration = 0.08;
const horizontalDeadZone = 7;

type TargetPose = -3 | 0 | 3;

export interface PlayerAnimation {
  pose: number;
  target: TargetPose;
  elapsed: number;
}

export function createPlayerAnimation(): PlayerAnimation {
  return { pose: 0, target: 0, elapsed: 0 };
}

export function advancePlayerAnimation(
  animation: PlayerAnimation,
  seconds: number,
  horizontalSpeed: number,
) {
  const target = getTargetPose(horizontalSpeed);
  const wasSteady = animation.pose === animation.target;
  animation.target = target;

  if (wasSteady && animation.pose !== target) moveOnePose(animation);

  animation.elapsed += seconds;
  while (animation.pose !== target && animation.elapsed >= transitionDuration) {
    const carry = animation.elapsed - transitionDuration;
    moveOnePose(animation);
    animation.elapsed = carry;
  }
}

function getTargetPose(horizontalSpeed: number): TargetPose {
  if (horizontalSpeed < -horizontalDeadZone) return -3;
  if (horizontalSpeed > horizontalDeadZone) return 3;
  return 0;
}

function moveOnePose(animation: PlayerAnimation) {
  animation.pose += Math.sign(animation.target - animation.pose);
  animation.elapsed = 0;
}

export function getPlayerFrame({ pose, elapsed }: PlayerAnimation) {
  const tick = Math.floor(elapsed / frameDuration);
  if (pose === 0) return { group: 'player', index: tick % 4 } as const;

  if (Math.abs(pose) === 3) {
    const group = pose < 0 ? 'playerLeft' : 'playerRight';
    return { group, index: tick % 3 } as const;
  }

  const group = pose < 0 ? 'playerLeftTransition' : 'playerRightTransition';
  return { group, index: Math.abs(pose) - 1 } as const;
}
