#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { promisify } = require('util');
const { exec } = require('child_process');

const execAsync = promisify(exec);

// Bridge CLI configuration
const BRIDGE_CLI_VERSION = '4.5.0rc3';
const BRIDGE_CLI_BASE_URL = 'https://artifactory.tools.duckutil.net/artifactory/clops-local/integrations/bridge/binaries/bridge-cli-bundle';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ ${message}`, colors.cyan);
}

function warn(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

// Bridge CLI Installation Functions

function detectPlatform() {
  const platform = os.platform();
  const arch = os.arch();

  if (platform === 'darwin') {
    return arch === 'arm64' ? 'macos_arm' : 'macosx';
  } else if (platform === 'linux') {
    return arch === 'arm64' ? 'linux_arm' : 'linux64';
  } else if (platform === 'win32') {
    return 'win64';
  }

  throw new Error(`Unsupported platform: ${platform} ${arch}`);
}

function getBridgeCLIUrl(platformId) {
  // All Bridge CLI bundles are in .zip format
  return `${BRIDGE_CLI_BASE_URL}/${BRIDGE_CLI_VERSION}/bridge-cli-bundle-${BRIDGE_CLI_VERSION}-${platformId}.zip`;
}

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);

    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        file.close();
        fs.unlinkSync(destination);
        return downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destination);
        return reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
      }

      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloaded = 0;

      response.on('data', (chunk) => {
        downloaded += chunk.length;
        const percent = ((downloaded / totalSize) * 100).toFixed(1);
        process.stdout.write(`\r  Downloading: ${percent}%`);
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        process.stdout.write('\n');
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(destination);
      reject(err);
    });
  });
}

async function extractArchive(archivePath, extractDir) {
  const isWindows = os.platform() === 'win32';

  // All Bridge CLI bundles are .zip files
  if (isWindows) {
    await execAsync(`powershell -command "Expand-Archive -Path '${archivePath}' -DestinationPath '${extractDir}' -Force"`);
  } else {
    // macOS/Linux - use unzip (removed -q flag to show progress)
    await execAsync(`unzip "${archivePath}" -d "${extractDir}"`);
  }
}

function getBridgeCLIInstallPath() {
  const homeDir = os.homedir();
  const isWindows = os.platform() === 'win32';

  if (isWindows) {
    return path.join(homeDir, 'bridge-cli');
  } else {
    // Try /usr/local/bin first, fallback to ~/bridge-cli
    try {
      fs.accessSync('/usr/local/bin', fs.constants.W_OK);
      return '/usr/local/bin';
    } catch {
      return path.join(homeDir, 'bridge-cli');
    }
  }
}

async function checkBridgeCLIInstalled() {
  try {
    const { stdout } = await execAsync('bridge-cli --version');
    return stdout.trim();
  } catch {
    return null;
  }
}

function parseVersion(versionString) {
  // Extract version number from strings like "Bridge CLI 4.5.0rc3" or "4.5.0rc3"
  const match = versionString.match(/(\d+\.\d+\.\d+(?:rc\d+)?)/);
  return match ? match[1] : null;
}

function compareVersions(current, latest) {
  // Simple version comparison
  // Returns: -1 if current < latest, 0 if equal, 1 if current > latest

  const currentClean = current.replace('rc', '.').split('.').map(Number);
  const latestClean = latest.replace('rc', '.').split('.').map(Number);

  for (let i = 0; i < Math.max(currentClean.length, latestClean.length); i++) {
    const c = currentClean[i] || 0;
    const l = latestClean[i] || 0;

    if (c < l) return -1;
    if (c > l) return 1;
  }

  return 0;
}

async function installBridgeCLI(force = false) {
  log('\n🔧 Installing Bridge CLI\n', colors.cyan);

  // Check if already installed
  const existingVersionString = await checkBridgeCLIInstalled();

  if (existingVersionString && !force) {
    const existingVersion = parseVersion(existingVersionString);
    const latestVersion = BRIDGE_CLI_VERSION;

    success(`Bridge CLI already installed: ${existingVersionString}`);

    if (existingVersion && latestVersion) {
      const comparison = compareVersions(existingVersion, latestVersion);

      if (comparison < 0) {
        warn(`\n⚠️  Newer version available: ${latestVersion}`);
        info('To update Bridge CLI, run:');
        info('  node cli/install.js --update-bridge-cli');
        info('\nOr manually download from:');
        info('  https://artifactory.tools.duckutil.net/artifactory/clops-local/integrations/bridge/binaries/bridge-cli-bundle/\n');
      } else if (comparison === 0) {
        success('You have the latest version!\n');
      } else {
        info(`You have a newer version (${existingVersion}) than bundled (${latestVersion})\n`);
      }
    }

    info('Skipping Bridge CLI installation\n');
    return;
  }

  if (force && existingVersionString) {
    info(`Current version: ${existingVersionString}`);
    info(`Reinstalling with version: ${BRIDGE_CLI_VERSION}\n`);
  }

  try {
    // Detect platform
    const platformId = detectPlatform();
    info(`Detected platform: ${platformId}`);

    // Get download URL
    const downloadUrl = getBridgeCLIUrl(platformId);
    info(`Download URL: ${downloadUrl}\n`);

    // Create temp directory
    const tempDir = path.join(os.tmpdir(), 'bridge-cli-install');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Download
    const archiveName = path.basename(downloadUrl);
    const archivePath = path.join(tempDir, archiveName);

    info('Downloading Bridge CLI...');
    await downloadFile(downloadUrl, archivePath);
    success('Download complete');

    // Determine installation path
    const installPath = getBridgeCLIInstallPath();
    if (!fs.existsSync(installPath)) {
      fs.mkdirSync(installPath, { recursive: true });
    }

    // Extract directly to installation directory
    info('Extracting Bridge CLI bundle...');
    await extractArchive(archivePath, installPath);
    success('Extraction complete');

    // Find the extracted bundle directory
    const files = fs.readdirSync(installPath);
    const bundleDir = files.find(f => f.startsWith('bridge-cli-bundle'));

    if (!bundleDir) {
      throw new Error('Bridge CLI bundle directory not found after extraction');
    }

    const finalBundlePath = path.join(installPath, bundleDir);
    const binaryName = os.platform() === 'win32' ? 'bridge-cli.exe' : 'bridge-cli';
    const finalBinaryPath = path.join(finalBundlePath, binaryName);

    // Make bridge-cli binary executable
    if (os.platform() !== 'win32' && fs.existsSync(finalBinaryPath)) {
      fs.chmodSync(finalBinaryPath, 0o755);
    }

    success(`Bridge CLI bundle installed to: ${finalBundlePath}`);
    success(`Bridge CLI binary: ${finalBinaryPath}`);

    // Add to PATH recommendation
    if (!installPath.includes('/usr/local/bin')) {
      warn('\nIMPORTANT: Add Bridge CLI to your PATH:');
      if (os.platform() === 'win32') {
        info(`  Add "${finalBundlePath}" to your system PATH environment variable`);
      } else {
        info(`  echo 'export PATH="${finalBundlePath}:$PATH"' >> ~/.bashrc`);
        info(`  echo 'export PATH="${finalBundlePath}:$PATH"' >> ~/.zshrc`);
      }
    }

    // Also copy entire bundle to repository root for local usage
    const repoRoot = path.join(__dirname, '..');
    const repoBundlePath = path.join(repoRoot, bundleDir);

    try {
      // Remove existing bundle if present
      if (fs.existsSync(repoBundlePath)) {
        fs.rmSync(repoBundlePath, { recursive: true, force: true });
      }

      // Copy entire bundle directory to repo root
      copyDirectory(finalBundlePath, repoBundlePath);

      // Make binary executable
      const repoBinaryPath = path.join(repoBundlePath, binaryName);
      if (os.platform() !== 'win32' && fs.existsSync(repoBinaryPath)) {
        fs.chmodSync(repoBinaryPath, 0o755);
      }

      success(`Bridge CLI bundle also copied to repository root: ${repoBundlePath}`);
    } catch (copyErr) {
      warn(`Could not copy to repository root: ${copyErr.message}`);
    }

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

    log('');
  } catch (err) {
    error(`Failed to install Bridge CLI: ${err.message}`);
    warn('You can manually download Bridge CLI from:');
    info('  https://artifactory.tools.duckutil.net/artifactory/clops-local/integrations/bridge/binaries/bridge-cli-bundle/');
    log('');
  }
}

// Agent providers configuration
const PROVIDERS = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    detect: `dir:${path.join(os.homedir(), '.claude')}`,
    mech: 'skill',
    profile: null // Claude Code uses direct skill installation
  },
  {
    id: 'cursor',
    label: 'Cursor',
    detect: `dir:${path.join(os.homedir(), '.cursor')}`,
    mech: 'skill',
    profile: 'cursor'
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    detect: `dir:${path.join(os.homedir(), '.windsurf')}`,
    mech: 'skill',
    profile: 'windsurf'
  },
  {
    id: 'cline',
    label: 'Cline',
    detect: `dir:${path.join(os.homedir(), '.cline')}`,
    mech: 'skill',
    profile: 'cline'
  },
  {
    id: 'github-copilot',
    label: 'GitHub Copilot',
    detect: `dir:${path.join(os.homedir(), '.github')}`,
    mech: 'skill',
    profile: 'github-copilot',
    soft: true
  },
  {
    id: 'codex',
    label: 'Codex',
    detect: `dir:${path.join(os.homedir(), '.codex')}`,
    mech: 'skill',
    profile: null
  }
];

async function checkAgentInstalled(detectClause) {
  const checks = detectClause.split('||');

  for (const check of checks) {
    const [type, value] = check.trim().split(':');

    if (type === 'dir') {
      const dirPath = value.replace('$HOME', os.homedir());
      if (fs.existsSync(dirPath)) {
        return true;
      }
    } else if (type === 'command') {
      try {
        await execAsync(`which ${value}`);
        return true;
      } catch {
        // Command not found
      }
    }
  }

  return false;
}

async function detectInstalledAgents() {
  const installed = [];

  for (const provider of PROVIDERS) {
    const isInstalled = await checkAgentInstalled(provider.detect);
    if (isInstalled) {
      installed.push(provider);
    }
  }

  return installed;
}

function getSkillPath() {
  // Determine path to skills directory
  const scriptDir = __dirname;
  return path.join(scriptDir, '..', 'skills', 'bridge-scan');
}

async function installForClaudeCode(skillPath) {
  const claudeDir = path.join(os.homedir(), '.claude');
  const skillsDir = path.join(claudeDir, 'skills');
  const targetDir = path.join(skillsDir, 'bridge-scan');

  // Create skills directory if it doesn't exist
  if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir, { recursive: true });
  }

  // Copy skill files (cli/ directory is already inside skillPath)
  copyDirectory(skillPath, targetDir);

  success(`Installed for Claude Code at ${targetDir}`);
}

async function installForCodex(skillPath) {
  const codexDir = path.join(os.homedir(), '.codex');
  const skillsDir = path.join(codexDir, 'skills');
  const targetDir = path.join(skillsDir, 'bridge-scan');

  if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir, { recursive: true });
  }

  // Copy skill files (cli/ directory is already inside skillPath)
  copyDirectory(skillPath, targetDir);

  success(`Installed for Codex at ${targetDir}`);
}

async function installViaSkillsCLI(provider) {
  try {
    info(`Installing via npx skills for ${provider.label}...`);
    const skillPath = getSkillPath();
    const skillFile = path.join(skillPath, 'SKILL.md');

    // Use npx skills add command
    await execAsync(`npx skills add ${skillFile} -a ${provider.profile}`);
    success(`Installed for ${provider.label} via npx skills`);
  } catch (err) {
    warn(`Could not install for ${provider.label}: ${err.message}`);
  }
}

function copyDirectory(source, target) {
  // Create target directory
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Read all files/folders in source
  const files = fs.readdirSync(source);

  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

async function install() {
  log('\n🔧 Bridge CLI Skill Installer\n', colors.cyan);

  // Step 1: Install Bridge CLI binary
  await installBridgeCLI();

  // Step 2: Detect and install skill for AI assistants
  info('Detecting installed AI assistants...\n');

  const installedAgents = await detectInstalledAgents();

  if (installedAgents.length === 0) {
    warn('No supported AI assistants detected.');
    info('Supported assistants: Claude Code, Cursor, Windsurf, Cline, Copilot, Codex');
    info('Install an AI assistant first, then run this installer again.');
    return;
  }

  log(`Found ${installedAgents.length} AI assistant(s):\n`, colors.green);
  installedAgents.forEach(agent => {
    log(`  • ${agent.label}`, colors.green);
  });
  log('');

  const skillPath = getSkillPath();

  if (!fs.existsSync(skillPath)) {
    error(`Skill files not found at ${skillPath}`);
    error('Make sure you are running this from the bridge-cli-skill directory');
    process.exit(1);
  }

  info('Installing Bridge CLI skill...\n');

  for (const agent of installedAgents) {
    try {
      if (agent.id === 'claude-code') {
        await installForClaudeCode(skillPath);
      } else if (agent.id === 'codex') {
        await installForCodex(skillPath);
      } else if (agent.profile) {
        await installViaSkillsCLI(agent);
      }
    } catch (err) {
      error(`Failed to install for ${agent.label}: ${err.message}`);
    }
  }

  log('\n✨ Installation complete!\n', colors.green);
  log('Usage:', colors.cyan);
  log('  Type /bridge-scan in any AI assistant to start\n');
}

async function uninstall() {
  log('\n🗑️  Uninstalling Bridge CLI Skill\n', colors.yellow);

  // Step 1: Remove skill from AI assistants
  const installedAgents = await detectInstalledAgents();

  for (const agent of installedAgents) {
    try {
      if (agent.id === 'claude-code') {
        const targetDir = path.join(os.homedir(), '.claude', 'skills', 'bridge-scan');
        if (fs.existsSync(targetDir)) {
          fs.rmSync(targetDir, { recursive: true });
          success(`Removed from Claude Code`);
        }
      } else if (agent.id === 'codex') {
        const targetDir = path.join(os.homedir(), '.codex', 'skills', 'bridge-scan');
        if (fs.existsSync(targetDir)) {
          fs.rmSync(targetDir, { recursive: true });
          success(`Removed from Codex`);
        }
      }
      // Note: For agents using npx skills, users need to remove via their IDE
    } catch (err) {
      warn(`Could not uninstall from ${agent.label}: ${err.message}`);
    }
  }

  // Step 2: Remove Bridge CLI
  log('\n🗑️  Removing Bridge CLI\n', colors.yellow);

  try {
    // Remove from repository root
    const repoRoot = path.join(__dirname, '..');
    const repoBundleDirs = fs.readdirSync(repoRoot).filter(f => f.startsWith('bridge-cli-bundle'));

    for (const bundleDir of repoBundleDirs) {
      const bundlePath = path.join(repoRoot, bundleDir);
      if (fs.existsSync(bundlePath)) {
        fs.rmSync(bundlePath, { recursive: true, force: true });
        success(`Removed Bridge CLI from repository: ${bundleDir}`);
      }
    }

    // Also remove standalone bridge-cli binary if exists in repo root
    const repoBridgeCli = path.join(repoRoot, os.platform() === 'win32' ? 'bridge-cli.exe' : 'bridge-cli');
    if (fs.existsSync(repoBridgeCli)) {
      fs.unlinkSync(repoBridgeCli);
      success(`Removed Bridge CLI binary from repository`);
    }

    // Remove from home directory installation
    const homeDir = os.homedir();
    const homeBridgeDir = path.join(homeDir, 'bridge-cli');

    if (fs.existsSync(homeBridgeDir)) {
      fs.rmSync(homeBridgeDir, { recursive: true, force: true });
      success(`Removed Bridge CLI from: ${homeBridgeDir}`);
    }

    // Note: We don't remove from /usr/local/bin as it might be a system-wide install
    // Users can manually remove if needed
    if (os.platform() !== 'win32') {
      const systemPath = '/usr/local/bin/bridge-cli';
      if (fs.existsSync(systemPath)) {
        warn(`Bridge CLI found in system location: ${systemPath}`);
        info(`To remove it, run: sudo rm -rf /usr/local/bin/bridge-cli*`);
      }
    }

  } catch (err) {
    warn(`Could not fully remove Bridge CLI: ${err.message}`);
  }

  log('\n✓ Uninstall complete\n', colors.green);
}

async function listAgents() {
  log('\n📋 Supported AI Assistants\n', colors.cyan);

  const installed = await detectInstalledAgents();
  const installedIds = new Set(installed.map(a => a.id));

  PROVIDERS.forEach(provider => {
    const status = installedIds.has(provider.id) ? '✓ Installed' : '✗ Not detected';
    const statusColor = installedIds.has(provider.id) ? colors.green : colors.yellow;
    const softTag = provider.soft ? ' (soft)' : '';
    log(`  ${provider.label}${softTag}: ${statusColor}${status}${colors.reset}`);
  });

  log('');
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--uninstall')) {
    await uninstall();
  } else if (args.includes('--list')) {
    await listAgents();
  } else if (args.includes('--update-bridge-cli')) {
    // Force reinstall Bridge CLI
    log('\n🔄 Updating Bridge CLI\n', colors.cyan);
    await installBridgeCLI(true); // Pass force=true
    log('\n✓ Bridge CLI update complete\n', colors.green);
  } else {
    await install();
  }
}

main().catch(err => {
  error(`Installation failed: ${err.message}`);
  process.exit(1);
});
