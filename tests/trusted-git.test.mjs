import { beforeEach, expect, it, vi } from 'vitest';
import { resolveTrustedGit } from '../scripts/trusted-git.mjs';

const { exists, realpath, stat } = vi.hoisted(() => ({
  exists: vi.fn(),
  realpath: vi.fn(),
  stat: vi.fn(),
}));

vi.mock('node:process', () => ({ default: { platform: 'linux' } }));
vi.mock('node:fs', () => ({
  accessSync: vi.fn(),
  constants: { X_OK: 1 },
  existsSync: exists,
  realpathSync: { native: realpath },
  statSync: stat,
}));

beforeEach(() => {
  vi.resetAllMocks();
  exists.mockImplementation((path) => path === '/usr/bin/git');
  realpath.mockImplementation((path) => path);
});

it('fails explicitly when no system Git is installed', () => {
  exists.mockReturnValue(false);

  expect(resolveTrustedGit).toThrow(
    'Could not verify a trusted Git executable',
  );
});

it.each([
  ['a user-owned executable', 1000, 0o755],
  ['a group-writable executable', 0, 0o775],
])('rejects %s even at the usual absolute path', (_label, uid, mode) => {
  stat.mockReturnValue({ isFile: () => true, uid, mode });

  expect(resolveTrustedGit).toThrow(
    'Could not verify a trusted Git executable',
  );
});

it('rejects an executable below a writable parent directory', () => {
  stat.mockImplementation((path) => ({
    isFile: () => path === '/usr/bin/git',
    uid: 0,
    mode: path === '/usr/bin' ? 0o777 : 0o755,
  }));

  expect(resolveTrustedGit).toThrow(
    'Could not verify a trusted Git executable',
  );
});
