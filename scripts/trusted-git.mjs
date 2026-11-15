import { execFileSync } from 'node:child_process';
import {
  accessSync,
  constants,
  existsSync,
  realpathSync,
  statSync,
} from 'node:fs';
import { dirname, isAbsolute } from 'node:path';
import process from 'node:process';

// Read Windows known folders and ACLs through the system PowerShell. This script
// accepts no repository paths, environment overrides, or executable arguments.
const windowsGitLookup = String.raw`
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
$trusted = @('S-1-5-18', 'S-1-5-32-544', 'S-1-5-80-956008885-3418522649-1831038044-1853292631-2271478464')
$sidType = [Security.Principal.SecurityIdentifier]
# Generic writes and writes to data, attributes, ownership or directory entries.
$writeRights = 0x500D0156

function Test-ManagedItem($item) {
  if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { return $false }
  $acl = $item.GetAccessControl()
  if ($acl.GetOwner($sidType).Value -notin $trusted) { return $false }
  foreach ($ace in $acl.GetAccessRules($true, $true, $sidType)) {
    if ($ace.AccessControlType -eq 'Allow' -and
        -not ($ace.PropagationFlags -band [Security.AccessControl.PropagationFlags]::InheritOnly) -and
        ($ace.FileSystemRights -band $writeRights) -and
        $ace.IdentityReference.Value -notin $trusted) { return $false }
  }
  return $true
}

foreach ($folder in 'ProgramFiles', 'ProgramFilesX86') {
  $knownPath = [Environment]::GetFolderPath($folder)
  if (-not $knownPath) { continue }
  $root = [IO.DirectoryInfo]::new($knownPath)
  if (-not $root.Exists -or -not (Test-ManagedItem $root)) { continue }
  foreach ($arch in 'mingw64', 'clangarm64', 'mingw32') {
    $file = [IO.FileInfo]::new([IO.Path]::Combine($root.FullName, 'Git', $arch, 'bin', 'git.exe'))
    if (-not $file.Exists -or -not (Test-ManagedItem $file)) { continue }
    $dir = $file.Directory
    while ($dir.FullName -ne $root.FullName -and (Test-ManagedItem $dir)) {
      $dir = $dir.Parent
    }
    if ($dir.FullName -eq $root.FullName) {
      [Console]::WriteLine($file.FullName)
      exit 0
    }
  }
}
`;

function findWindowsGit() {
  // GLOBALROOT resolves the OS SystemRoot link, independently of environment
  // variables. CreateProcess needs the canonical DOS path returned by realpath.
  const systemPowerShell =
    '\\\\?\\GLOBALROOT\\SystemRoot\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
  const shell = realpathSync.native(systemPowerShell);
  const command = Buffer.from(windowsGitLookup, 'utf16le').toString('base64');
  const git = execFileSync(
    shell,
    ['-NoProfile', '-NonInteractive', '-EncodedCommand', command],
    {
      encoding: 'utf8',
      windowsHide: true,
    },
  ).trim();

  if (isAbsolute(git) && statSync(git).isFile())
    return realpathSync.native(git);
  return undefined;
}

function isRootManaged(path) {
  const info = statSync(path);
  // Reject ownership or write permissions outside the administrator boundary.
  return info.uid === 0 && (info.mode & 0o022) === 0;
}

function isManagedPosixExecutable(file) {
  if (!statSync(file).isFile() || !isRootManaged(file)) return false;

  let directory = dirname(file);
  while (isRootManaged(directory)) {
    const parent = dirname(directory);
    if (parent === directory) {
      accessSync(file, constants.X_OK);
      return true;
    }
    directory = parent;
  }
  return false;
}

function findPosixGit() {
  for (const candidate of ['/usr/bin/git', '/bin/git', '/usr/local/bin/git']) {
    if (!existsSync(candidate)) continue;
    const file = realpathSync.native(candidate);
    if (isManagedPosixExecutable(file)) return file;
  }
  return undefined;
}

export function resolveTrustedGit() {
  try {
    const file =
      process.platform === 'win32' ? findWindowsGit() : findPosixGit();
    if (file) return file;
  } catch (error) {
    throw new Error(
      'Could not verify a trusted Git executable. Install system-managed Git.',
      { cause: error },
    );
  }

  throw new Error(
    'Could not verify a trusted Git executable. Install system-managed Git.',
  );
}
