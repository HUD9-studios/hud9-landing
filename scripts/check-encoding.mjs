import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { TextDecoder } from 'node:util';

const root = resolve(import.meta.dirname, '..');
const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
const args = process.argv.slice(2);
const requestedPaths = args[0] === '--' ? args.slice(1) : args;
const staged = args.length > 0;

function git(command, options) {
  return execFileSync('git', command, {
    cwd: root,
    maxBuffer: Infinity,
    ...options,
  });
}

function listTextFiles() {
  const paths = staged
    ? git(
        ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z', '--'],
        {
          encoding: 'utf8',
        },
      )
    : git(['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
        encoding: 'utf8',
      });
  const requested = new Set(
    requestedPaths.map((file) =>
      relative(root, resolve(file)).split(sep).join('/'),
    ),
  );
  const files = paths
    .split('\0')
    .filter((file) => file && (!staged || requested.has(file)));
  if (files.length === 0) return new Set();

  const attributes = git(
    ['check-attr', ...(staged ? ['--cached'] : []), '-z', '--stdin', 'text'],
    {
      input: files.join('\0') + '\0',
      encoding: 'utf8',
    },
  ).split('\0');

  return new Set(
    attributes.filter(
      (file, index) =>
        index % 3 === 0 && file && attributes[index + 2] !== 'unset',
    ),
  );
}

function readTextFile(file) {
  if (staged) return git(['cat-file', 'blob', ':' + file]);

  try {
    return readFileSync(resolve(root, file));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return undefined;
  }
}

function validateFile(file) {
  const bytes = readTextFile(file);
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
  if (/[ \t]+$/m.test(source)) issues.push('trailing whitespace');

  return issues;
}

const files = listTextFiles();
let failed = false;

for (const file of files) {
  const issues = validateFile(file);
  if (issues.length > 0) {
    console.error('%s: %s', file, issues.join(', '));
    failed = true;
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log('Encoding check passed for %d text paths.', files.size);
}
