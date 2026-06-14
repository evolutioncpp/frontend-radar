import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const playwrightCliPath = 'node_modules/@playwright/test/cli.js';
const appendNodeOption = (value, option) => {
  const options = value?.trim();

  if (!options) {
    return option;
  }

  return options.includes(option) ? options : `${options} ${option}`;
};
const e2eEnv = {
  ...process.env,
  FORCE_COLOR: process.env.FORCE_COLOR ?? '1',
  NODE_OPTIONS: appendNodeOption(process.env.NODE_OPTIONS, '--disable-warning=DEP0205'),
  VITE_API_BASE_URL: process.env.VITE_API_BASE_URL ?? 'http://localhost:3001',
};
const previewUrl = 'http://127.0.0.1:5173';

const spawnCommand = (
  command,
  args,
  windowsCommand = command,
  env = e2eEnv,
  useWindowsShell = isWindows,
) => {
  return spawn(
    isWindows && useWindowsShell ? windowsCommand : command,
    isWindows && useWindowsShell ? [] : args,
    {
      env,
      shell: isWindows && useWindowsShell,
      stdio: 'inherit',
      windowsHide: true,
    },
  );
};

const run = (
  command,
  args,
  windowsCommand = command,
  env = e2eEnv,
  useWindowsShell = isWindows,
) => {
  return new Promise((resolve, reject) => {
    const child = spawnCommand(command, args, windowsCommand, env, useWindowsShell);

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code ?? 'null'}`));
    });
  });
};

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const waitForPreview = async () => {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(previewUrl, { method: 'HEAD' });

      if (response.ok) {
        return;
      }
    } catch {
      // The preview server is still starting.
    }

    await sleep(250);
  }

  throw new Error(`Preview server did not become ready at ${previewUrl}`);
};

const stopChild = (child) => {
  return new Promise((resolve) => {
    let isSettled = false;
    const settle = () => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      clearTimeout(forceResolveTimeout);
      resolve();
    };

    const forceResolveTimeout = setTimeout(settle, 5_000);

    child.once('exit', settle);
    child.once('error', settle);

    if (!child.pid || child.killed) {
      settle();
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
  });
};

const ansiEscapePattern = /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/gu;

const normalizePlaywrightOutput = (value) => {
  return value.replace(ansiEscapePattern, '').replace(/\r/g, '');
};

const hasPlaywrightSuccessSummary = (value) => {
  return /(^|\n)\s*\d+\s+passed\b/u.test(normalizePlaywrightOutput(value));
};

const hasPlaywrightFailureSummary = (value) => {
  return /(^|\n)\s*\d+\s+(?:failed|timed out|interrupted)\b/u.test(
    normalizePlaywrightOutput(value),
  );
};

const isPlaywrightRunSuccessful = (value) => {
  return hasPlaywrightSuccessSummary(value) && !hasPlaywrightFailureSummary(value);
};

const runPlaywright = () => {
  return new Promise((resolve, reject) => {
    let isSettled = false;
    let output = '';
    let successExitTimeout;
    const child = spawn(process.execPath, [playwrightCliPath, 'test'], {
      env: {
        ...e2eEnv,
        FORCE_COLOR: '0',
        FRONTEND_RADAR_E2E_EXTERNAL_SERVER: '1',
      },
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    const settle = (callback) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      clearTimeout(successExitTimeout);
      callback();
    };

    const scheduleSuccessExit = () => {
      if (successExitTimeout) {
        return;
      }

      successExitTimeout = setTimeout(() => {
        void stopChild(child).finally(() => {
          settle(resolve);
        });
      }, 1_000);
    };

    const handleOutput = (chunk, stream) => {
      const text = chunk.toString();
      output += text;
      stream.write(text);

      if (isPlaywrightRunSuccessful(output)) {
        scheduleSuccessExit();
      }
    };

    child.stdout.on('data', (chunk) => handleOutput(chunk, process.stdout));
    child.stderr.on('data', (chunk) => handleOutput(chunk, process.stderr));
    child.on('error', (error) => settle(() => reject(error)));
    child.on('exit', (code) => {
      if (code === 0 || isPlaywrightRunSuccessful(output)) {
        settle(resolve);
        return;
      }

      settle(() => reject(new Error(`Playwright failed with exit code ${code ?? 'null'}`)));
    });
  });
};

let exitCode = 0;

try {
  await run(npmCommand, ['run', 'build'], `${npmCommand} run build`);

  const preview = spawnCommand(
    npmCommand,
    ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '5173', '--strictPort'],
    `${npmCommand} run preview -- --host 127.0.0.1 --port 5173 --strictPort`,
  );

  try {
    await waitForPreview();
    await runPlaywright();
  } finally {
    await stopChild(preview);
  }
} catch (error) {
  exitCode = 1;
  console.error(error);
} finally {
  process.exit(exitCode);
}
