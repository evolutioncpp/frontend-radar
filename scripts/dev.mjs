import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const children = new Set();

const npmSpawnOptions = isWindows ? { shell: true, windowsHide: true } : { shell: false };
const getNpmScriptCommand = (script) => (isWindows ? `${npmCommand} run ${script}` : npmCommand);
const getNpmScriptArgs = (script) => (isWindows ? [] : ['run', script]);

const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      env: {
        ...process.env,
        FORCE_COLOR: process.env.FORCE_COLOR ?? '1',
      },
      ...options,
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with ${signal ?? code}`));
    });
  });

const start = (name, command, args) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    ...npmSpawnOptions,
    env: {
      ...process.env,
      FORCE_COLOR: process.env.FORCE_COLOR ?? '1',
    },
  });

  children.add(child);

  child.on('exit', (code, signal) => {
    children.delete(child);

    if (stopping) {
      return;
    }

    console.error(`[dev] ${name} stopped with ${signal ?? code}`);
    stopAll(code === 0 ? 0 : 1);
  });

  child.on('error', (error) => {
    children.delete(child);

    if (stopping) {
      return;
    }

    console.error(`[dev] ${name} failed:`, error);
    stopAll(1);
  });

  return child;
};

let stopping = false;

const stopChild = (child) => {
  if (!child.pid || child.killed) {
    return;
  }

  if (isWindows) {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      shell: false,
    });
    return;
  }

  child.kill('SIGTERM');
};

const stopAll = (exitCode = 0) => {
  if (stopping) {
    return;
  }

  stopping = true;

  for (const child of children) {
    stopChild(child);
  }

  setTimeout(() => {
    process.exit(exitCode);
  }, 250);
};

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));

console.log('[dev] Starting PostgreSQL container...');
await run('docker', ['compose', 'up', '-d', 'postgres']);

console.log('[dev] Starting API and Web dev servers...');
start('api', getNpmScriptCommand('dev:api'), getNpmScriptArgs('dev:api'));
start('web', getNpmScriptCommand('dev:web'), getNpmScriptArgs('dev:web'));
