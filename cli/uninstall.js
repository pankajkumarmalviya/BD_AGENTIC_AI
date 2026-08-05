#!/usr/bin/env node

/**
 * Bridge CLI Skill Uninstaller
 *
 * Simple wrapper that calls install.js with --uninstall flag
 */

const { spawn } = require('child_process');
const path = require('path');

const installScript = path.join(__dirname, 'install.js');

// Run install.js with --uninstall flag
const child = spawn('node', [installScript, '--uninstall'], {
  stdio: 'inherit',
  cwd: __dirname
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
