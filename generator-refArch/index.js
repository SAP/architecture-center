#!/usr/bin/env node
import { execSync } from 'child_process';
import yeomanEnv from 'yeoman-environment';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

// Check Node.js version
const MIN_NODE_VERSION = 18;
const currentNodeVersion = process.versions.node.split('.')[0];

if (parseInt(currentNodeVersion, 10) < MIN_NODE_VERSION) {
  console.error(
    `\x1b[31mYou are running Node.js ${process.versions.node}, but the lowest supported version of Architecture Center CLI is Node.js 18.x. Please upgrade your Node.js version.\x1b[0m`
  );
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Clear the terminal (Cross-platform)
const clearCommand = process.platform === 'win32' ? 'cls' : 'clear';
try {
  execSync(clearCommand, { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to clear console:', error.message);
}

const env = new yeomanEnv();
env.register(join(__dirname, 'app'), 'yo:genrefarch');
env.run(['yo:genrefarch', ...process.argv.splice(2)]);
