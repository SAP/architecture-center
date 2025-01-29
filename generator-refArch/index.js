#!/usr/bin/env node
import { execSync } from 'child_process';
import yeomanEnv from 'yeoman-environment';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Clear the terminal
execSync('clear', { stdio: 'inherit' });

const env = new yeomanEnv();
env.register(join(__dirname, 'app'), 'yo:genrefarch');
env.run(['yo:genrefarch', ...process.argv.splice(2)]);
