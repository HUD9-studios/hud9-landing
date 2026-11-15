import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { TextDecoder } from 'node:util';
import { resolveTrustedGit } from './trusted-git.mjs';

const repoRoot = resolve(import.meta.dirname, '..');
const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

function listTextFiles(git, requested, staged) {
  const paths = staged
    ? git(
        [
          'diff',
          '--cached',
          '--name-only',
          '--no-ext-diff',
          '--diff-filter=ACMR',
          '-z',
          '--',
        ],
        { encoding: 'utf8' },
      )
    : git(['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
        encoding: 'utf8',
      });
  const files = paths
    .split('\0')
    .filter((file) => file && (!staged || requested.has(file)));
  if (files.length === 0) return new Set();

  const attributes = git(
    ['check-attr', ...(staged ? ['--cached'] : []), '-z', '--stdin', 'text'],
    { input: files.join('\0') + '\0', encoding: 'utf8' },
  ).split('\0');

  return new Set(
    attributes.filter(
      (file, index) =>
        index % 3 === 0 && file && attributes[index + 2] !== 'unset',
    ),
  );
}

function readTextFile(git, root, file, staged) {
  if (staged) return git(['cat-file', 'blob', ':' + file]);

  try {
    return readFileSync(resolve(root, file));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return undefined;
  }
}

function hasTrailingWhitespace(source) {
  return source
    .split(/\r\n|[\n\r\u2028\u2029]/u)
    .some((line) => line.endsWith(' ') || line.endsWith('\t'));
}

function validateFile(bytes) {
  if (!bytes) return [];

  let source;
  try {
    source = decoder.decode(bytes);
  } catch {
    return ['invalid UTF-8'];
  }

  const issues = [];
  if (source.startsWith('\uFEFF')) issues.push('UTF-8 BOM');
  if (source.includes('\0')) issues.push('NUL in text file');
  if (source.includes('\r')) issues.push('CR or CRLF line endings');
  if (source.length > 0 && !source.endsWith('\n'))
    issues.push('missing final newline');
  if (hasTrailingWhitespace(source)) issues.push('trailing whitespace');

  return issues;
}

export function runEncodingCheck(
  args = process.argv.slice(2),
  { root = repoRoot, cwd = process.cwd() } = {},
) {
  try {
    const executable = resolveTrustedGit();
    const git = (command, options) =>
      execFileSync(executable, ['-c', 'core.fsmonitor=false', ...command], {
        cwd: root,
        maxBuffer: Infinity,
        ...options,
      });
    const staged = args.length > 0;
    const paths = args[0] === '--' ? args.slice(1) : args;
    const requested = new Set(
      paths.map((file) =>
        relative(root, resolve(cwd, file)).split(sep).join('/'),
      ),
    );

    const files = listTextFiles(git, requested, staged);
    let failed = false;

    for (const file of files) {
      const issues = validateFile(readTextFile(git, root, file, staged));
      if (issues.length > 0) {
        console.error('%s: %s', file, issues.join(', '));
        failed = true;
      }
    }

    if (failed) return 1;
    console.log('Encoding check passed for %d text paths.', files.size);
    return 0;
  } catch (error) {
    console.error('Encoding check failed: %s', error.message);
    return 1;
  }
}

if (import.meta.main) process.exitCode = runEncodingCheck();
