const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// Prepend local Node/NPM directory to PATH if it exists
const localNodeBinDir = path.resolve(__dirname, '.node/node-v20.15.0-win-x64');
if (fs.existsSync(localNodeBinDir)) {
  const pathKey = process.platform === 'win32' ? 'Path' : 'PATH';
  process.env[pathKey] = localNodeBinDir + path.delimiter + (process.env[pathKey] || '');
  console.log(`Using local Node/NPM from: ${localNodeBinDir}`);
}

// Clear lingering processes on port 3000 / 4321 to prevent EADDRINUSE errors
try {
  const { execSync } = require('child_process');
  if (isWindows) {
    // Find PIDs listening on port 3000
    const stdout = execSync('netstat -ano | findstr :3000', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const lines = stdout.split('\n');
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && parseInt(pid) !== process.pid) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`Cleared process PID ${pid} occupying port 3000.`);
        } catch (e) {}
      }
    });
  }
} catch (e) {
  // Ignore if port 3000 was free
}

console.log('Starting JKSPDC Web Platform (Frontend & Backend)...');

function runProcess(name, dir, args, colorCode) {
  const child = spawn(npmCmd, args, {
    cwd: path.resolve(__dirname, dir),
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  const reset = '\x1b[0m';
  const color = `\x1b[${colorCode}m`;

  const log = (data, isError = false) => {
    const stream = isError ? process.stderr : process.stdout;
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      // Avoid printing empty lines
      if (line.trim() !== '') {
        stream.write(`${color}[${name}]${reset} ${line}\n`);
      }
    });
  };

  child.stdout.on('data', data => log(data));
  child.stderr.on('data', data => log(data, true));

  child.on('error', (err) => {
    console.error(`${color}[${name}] Failed to start process:${reset}`, err);
  });

  child.on('close', (code) => {
    console.log(`${color}[${name}] Process exited with code ${code}${reset}`);
  });

  return child;
}

// Spawns the Astro dev server for frontend and NestJS start script for backend
// Using Cyan (36) for Frontend and Magenta (35) for Backend
const frontend = runProcess('Frontend', 'website', ['run', 'dev'], 36);
const backend = runProcess('Backend', 'backend', ['run', 'start'], 35);

function cleanup() {
  console.log('\nStopping frontend and backend servers...');
  if (frontend) {
    try {
      frontend.kill('SIGINT');
    } catch (e) {}
  }
  if (backend) {
    try {
      backend.kill('SIGINT');
    } catch (e) {}
  }
  process.exit();
}

// Register termination signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
