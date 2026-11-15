import { execFileSync, spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { runEncodingCheck } from '../scripts/check-encoding.mjs';
import { resolveTrustedGit } from '../scripts/trusted-git.mjs';

const gitExecutable = resolveTrustedGit();
const repoRoot = resolve(import.meta.dirname, '..');
let root;

function git(...args) {
  return execFileSync(gitExecutable, args, {
    cwd: root,
    encoding: 'utf8',
  }).trim();
}

function write(file, content) {
  writeFileSync(join(root, file), content);
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'hud9-encoding-'));
  git('init', '--quiet');
  write('.gitattributes', '* text=auto eol=lf\n*.png binary\n');
  write('.gitignore', 'ignored.md\n');
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  expect(dirname(resolve(root))).toBe(resolve(tmpdir()));
  expect(basename(root)).toMatch(/^hud9-encoding-/);
  rmSync(root, { recursive: true, force: true });
});

it('checks the full work tree, ignoring deleted, ignored and binary paths', () => {
  write('good file.md', 'Texto español válido\n');
  write('ignored.md', Buffer.from([0xc3, 0x28]));
  write('image.png', Buffer.from([0xc3, 0x28, 0]));
  write('deleted.md', 'Removed\n');
  git('add', 'deleted.md');
  rmSync(join(root, 'deleted.md'));

  expect(runEncodingCheck([], { root })).toBe(0);
  expect(console.log).toHaveBeenCalledWith(
    'Encoding check passed for %d text paths.',
    4,
  );
});

it('reads staged bytes and staged binary attributes for paths containing spaces', () => {
  write('staged file.md', 'Staged text\n');
  write('image.png', Buffer.from([0xc3, 0x28, 0]));
  git('add', '.gitattributes', 'staged file.md', 'image.png');
  write('.gitattributes', '* text=auto eol=lf\n');
  write('staged file.md', Buffer.from([0xc3, 0x28]));

  expect(
    runEncodingCheck(['--', 'staged file.md', join(root, 'image.png')], {
      root,
      cwd: root,
    }),
  ).toBe(0);
  expect(console.log).toHaveBeenCalledWith(
    'Encoding check passed for %d text paths.',
    1,
  );
});

it('checks the staged rename destination and skips staged deletions', () => {
  const [objects, baseline] = execFileSync(
    gitExecutable,
    ['rev-parse', '--path-format=absolute', '--git-path', 'objects', 'HEAD'],
    { cwd: repoRoot, encoding: 'utf8' },
  )
    .trimEnd()
    .split(/\r?\n/);
  const checkout = join(root, 'checkout');
  git('init', '--quiet', checkout);
  write(
    'checkout/.git/objects/info/alternates',
    objects.replaceAll('\\', '/') + '\n',
  );
  git('-C', checkout, 'checkout', '--quiet', '--detach', baseline);
  git('-C', checkout, 'mv', 'README.md', 'renamed readme.md');
  git('-C', checkout, 'rm', '--quiet', '.editorconfig');
  const args = ['README.md', 'renamed readme.md', '.editorconfig'];

  expect(runEncodingCheck(args, { root: checkout, cwd: checkout })).toBe(0);
  expect(console.log).toHaveBeenCalledWith(
    'Encoding check passed for %d text paths.',
    1,
  );
});

it('reports invalid UTF-8, BOM, NUL, CRLF, final newline and trailing whitespace', () => {
  write('bad UTF-8.md', Buffer.from([0xc3, 0x28, 0x0a]));
  write('bad text.md', '\uFEFFline\u0000 \t\r\nend');

  expect(runEncodingCheck([], { root })).toBe(1);
  expect(console.error).toHaveBeenCalledWith(
    '%s: %s',
    'bad UTF-8.md',
    'invalid UTF-8',
  );
  expect(console.error).toHaveBeenCalledWith(
    '%s: %s',
    'bad text.md',
    'UTF-8 BOM, NUL in text file, CR or CRLF line endings, missing final newline, trailing whitespace',
  );
});

it('reports CRLF from the actual staged blob', () => {
  write('raw CRLF.md', 'text\r\n');
  const blob = git('hash-object', '-w', '--no-filters', 'raw CRLF.md');
  git(
    'update-index',
    '--add',
    '--cacheinfo',
    '100644,' + blob + ',raw CRLF.md',
  );

  expect(runEncodingCheck(['raw CRLF.md'], { root, cwd: root })).toBe(1);
  expect(console.error).toHaveBeenCalledWith(
    '%s: %s',
    'raw CRLF.md',
    'CR or CRLF line endings',
  );
});

it('allows long interior runs and catches spaces or tabs at line ends', () => {
  write('long line.md', 'a' + ' '.repeat(250_000) + 'b\n');
  expect(runEncodingCheck([], { root })).toBe(0);

  write('line endings.md', 'before \u2028after\t\n');
  expect(runEncodingCheck([], { root })).toBe(1);
  expect(console.error).toHaveBeenCalledWith(
    '%s: %s',
    'line endings.md',
    'trailing whitespace',
  );
});

it('accepts an empty staged selection and reports Git execution failures', () => {
  expect(runEncodingCheck(['--'], { root })).toBe(0);
  expect(console.log).toHaveBeenCalledWith(
    'Encoding check passed for %d text paths.',
    0,
  );

  expect(runEncodingCheck([], { root: join(root, 'missing') })).toBe(1);
  expect(console.error).toHaveBeenCalledWith(
    'Encoding check failed: %s',
    expect.any(String),
  );
});

it('returns real CLI exit codes and keeps the same Git executable with an untrusted PATH', () => {
  vi.stubEnv('PATH', root);
  vi.stubEnv('ProgramFiles', root);
  expect(resolveTrustedGit()).toBe(gitExecutable);
  mkdirSync(join(root, 'scripts'));
  for (const file of ['check-encoding.mjs', 'trusted-git.mjs']) {
    copyFileSync(join(repoRoot, 'scripts', file), join(root, 'scripts', file));
  }
  const args = [join(root, 'scripts/check-encoding.mjs')];
  expect(spawnSync(process.execPath, args, { cwd: root }).status).toBe(0);

  write('bad CLI.md', '\uFEFFnot allowed\n');
  git('add', 'bad CLI.md');
  const result = spawnSync(process.execPath, [...args, '--', 'bad CLI.md'], {
    cwd: root,
    encoding: 'utf8',
  });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('bad CLI.md: UTF-8 BOM');
});
