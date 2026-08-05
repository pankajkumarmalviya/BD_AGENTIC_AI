#!/usr/bin/env node

/**
 * Remote Repository Cloner for Bridge CLI Scans
 *
 * Clones a GitHub repository to a temporary location for scanning.
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const os = require('os');

const execAsync = promisify(exec);

// Parse arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
      params[key] = value;
      if (value !== 'true') i++;
    }
  }

  return params;
}

// Extract repo name from URL
function getRepoName(url) {
  // https://github.com/user/repo.git -> repo
  // https://github.com/user/repo -> repo
  const match = url.match(/\/([^\/]+?)(\.git)?$/);
  return match ? match[1] : 'repo';
}

// Clone repository
async function cloneRepo(url, destination) {
  console.log(`\n🔄 Cloning repository...`);
  console.log(`   URL: ${url}`);
  console.log(`   Destination: ${destination}\n`);

  try {
    // Check if git is installed
    await execAsync('git --version');
  } catch (err) {
    throw new Error('Git is not installed. Please install Git first.');
  }

  // Create parent directory if needed
  const parentDir = path.dirname(destination);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  // Remove existing directory if present
  if (fs.existsSync(destination)) {
    console.log(`⚠️  Directory already exists, removing...`);
    fs.rmSync(destination, { recursive: true, force: true });
  }

  // Clone with progress
  const { stdout, stderr } = await execAsync(`git clone ${url} "${destination}"`, {
    maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large repos
  });

  if (stderr && !stderr.includes('Cloning into')) {
    console.error(stderr);
  }

  console.log(`✓ Repository cloned successfully\n`);
  return destination;
}

// Main
async function main() {
  const params = parseArgs();

  if (!params.url || params.help) {
    console.log(`
Remote Repository Cloner

Usage:
  node clone-repo.js --url <github-url> [options]

Options:
  --url <url>           GitHub repository URL (required)
  --destination <path>  Clone destination (default: /tmp/<repo-name>-bridge-scan)
  --branch <name>       Specific branch to clone
  --depth <n>           Clone depth (shallow clone)

Examples:
  # Clone to default temp location
  node clone-repo.js --url https://github.com/user/repo

  # Clone to specific location
  node clone-repo.js --url https://github.com/user/repo --destination /tmp/my-scan

  # Shallow clone (faster)
  node clone-repo.js --url https://github.com/user/repo --depth 1

  # Clone specific branch
  node clone-repo.js --url https://github.com/user/repo --branch develop
`);
    process.exit(params.help ? 0 : 1);
  }

  const url = params.url;
  const repoName = getRepoName(url);
  const destination = params.destination || path.join(os.tmpdir(), `${repoName}-bridge-scan`);

  try {
    let cloneCommand = `git clone`;

    if (params.depth) {
      cloneCommand += ` --depth ${params.depth}`;
    }

    if (params.branch) {
      cloneCommand += ` --branch ${params.branch}`;
    }

    cloneCommand += ` ${url} "${destination}"`;

    console.log(`\n🔄 Cloning repository...`);
    console.log(`   URL: ${url}`);
    console.log(`   Destination: ${destination}`);
    if (params.branch) console.log(`   Branch: ${params.branch}`);
    if (params.depth) console.log(`   Depth: ${params.depth}`);
    console.log();

    // Create parent directory
    const parentDir = path.dirname(destination);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // Remove existing directory
    if (fs.existsSync(destination)) {
      console.log(`⚠️  Directory already exists, removing...`);
      fs.rmSync(destination, { recursive: true, force: true });
    }

    // Clone
    const { stderr } = await execAsync(cloneCommand, {
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    if (stderr && !stderr.includes('Cloning into')) {
      console.error(stderr);
    }

    console.log(`✓ Repository cloned successfully`);
    console.log(`\nCloned to: ${destination}\n`);

    // Output JSON for easy parsing
    console.log(JSON.stringify({
      success: true,
      destination: destination,
      repoName: repoName
    }));

  } catch (err) {
    console.error(`\n✗ Clone failed: ${err.message}\n`);
    process.exit(1);
  }
}

main();
