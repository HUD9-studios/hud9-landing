import { beforeEach, expect, it, vi } from 'vitest';
import { resolveTrustedGit } from '../scripts/trusted-git.mjs';

const { access, exists, realpath, stat } = vi.hoisted(() => ({
  access: vi.fn(),
  exists: vi.fn(),
  realpath: vi.fn(),
  stat: vi.fn(),
}));

vi.mock('node:process', () => ({ default: { platform: 'linux' } }));
vi.mock('node:fs', () => ({
  accessSync: access,
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

function mockSystemExecutable() {
  realpath.mockReturnValue('/usr/libexec/git');
  stat.mockImplementation((path) => ({
    isFile: () => path === '/usr/libexec/git',
    uid: 0,
    mode: 0o755,
  }));
}

it('returns the resolved system executable after checking execute access', () => {
  mockSystemExecutable();
  expect(resolveTrustedGit()).toBe('/usr/libexec/git');
  expect(access).toHaveBeenCalledExactlyOnceWith('/usr/libexec/git', 1);
});

it('retains the cause when a managed Git executable cannot be run', () => {
  mockSystemExecutable();
  const denied = new Error('Execute access denied');
  access.mockImplementation(() => {
    throw denied;
  });
  expect(() => resolveTrustedGit()).toThrow(
    expect.objectContaining({ cause: denied }),
  );
});
