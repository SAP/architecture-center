#!/usr/bin/env node
import { execSync } from 'child_process';
import yeomanEnv from 'yeoman-environment';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import chalk from 'chalk';

// Constants
const MIN_NODE_VERSION = 18;
const CLEAR_COMMANDS = {
  win32: 'cls',
  default: 'clear'
};

// Check Node.js version
const checkNodeVersion = () => {
  const currentNodeVersion = parseInt(process.versions.node.split('.')[0], 10);
  
  if (currentNodeVersion < MIN_NODE_VERSION) {
    console.error(
      chalk.red(`You are running Node.js ${process.versions.node}, but the lowest supported version of Architecture Center CLI is Node.js ${MIN_NODE_VERSION}.x. Please upgrade your Node.js version.`)
    );
    process.exit(1);
  }
};

// Clear terminal with better error handling
const clearTerminal = () => {
  const clearCommand = CLEAR_COMMANDS[process.platform] || CLEAR_COMMANDS.default;
  
  try {
    execSync(clearCommand, { stdio: 'inherit' });
  } catch (error) {
    // Silently fail - clearing terminal is not critical
    // console.error('Failed to clear console:', error.message);
  }
};

// Main execution
const main = () => {
  try {
    checkNodeVersion();
    clearTerminal();
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    const env = new yeomanEnv();
    env.register(join(__dirname, 'app'), 'yo:genrefarch');
    env.run(['yo:genrefarch', ...process.argv.slice(2)]);
  } catch (error) {
    console.error(chalk.red(`Error starting generator: ${error.message}`));
    process.exit(1);
  }
};

main();
