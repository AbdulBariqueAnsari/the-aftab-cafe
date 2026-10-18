const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWin = process.platform === 'win32';
const localTsx = path.join(__dirname, 'node_modules', '.bin', isWin ? 'tsx.cmd' : 'tsx');
const serverFile = path.join(__dirname, 'server', 'src', 'index.ts');

let cmd;
let args;

if (fs.existsSync(localTsx)) {
  cmd = localTsx;
  args = [serverFile];
} else {
  cmd = isWin ? 'npx.cmd' : 'npx';
  args = ['tsx', serverFile];
}

const child = spawn(cmd, args, {
  stdio: 'inherit',
  shell: isWin,
  env: process.env,
});

child.on('close', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('Failed to launch server:', err);
  process.exit(1);
});
