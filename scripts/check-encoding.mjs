import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TextDecoder } from 'node:util';

const root = resolve(import.meta.dirname, '..');
const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

function listTextFiles() {
  const files = execFileSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    {
      cwd: root,
    },
  );

  const attributes = execFileSync(
    'git',
    ['check-attr', '-z', '--stdin', 'text'],
    {
      cwd: root,
      input: files,
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

function validateFile(file) {
  let bytes;

  try {
    bytes = readFileSync(resolve(root, file));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }

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
