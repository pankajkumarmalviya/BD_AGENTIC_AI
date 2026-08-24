#!/usr/bin/env node

/**
 * YAML Configuration Scanner for Bridge CLI
 *
 * Scans a directory for YAML files containing Bridge CLI configuration
 * and extracts scan type and configuration details.
 *
 * Usage:
 *   node scan-yaml-config.js --directory /path/to/project
 *
 * Output:
 *   JSON object with detected configurations
 */

const fs = require('fs');
const path = require('path');

// Simple YAML parser (no external dependencies)
function parseSimpleYaml(yamlString) {
  const lines = yamlString.split('\n');
  const result = {};
  const stack = [{ obj: result, indent: -1 }];

  for (let line of lines) {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || line.trim() === '') continue;

    // Calculate indentation
    const indent = line.search(/\S/);
    if (indent === -1) continue;

    const trimmed = line.trim();

    // Handle key-value pairs
    if (trimmed.includes(':')) {
      const colonIndex = trimmed.indexOf(':');
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();

      // Pop stack to correct level
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const current = stack[stack.length - 1].obj;

      if (value === '' || value === '{}' || value === '[]') {
        // Empty object or array
        current[key] = value === '[]' ? [] : {};
        stack.push({ obj: current[key], indent: indent });
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array
        current[key] = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
      } else if (value.startsWith('"') || value.startsWith("'")) {
        // String value
        current[key] = value.replace(/['"]/g, '');
      } else if (!isNaN(value)) {
        // Number value
        current[key] = parseFloat(value);
      } else if (value === 'true' || value === 'false') {
        // Boolean value
        current[key] = value === 'true';
      } else {
        // Regular string value
        current[key] = value;
      }
    } else if (trimmed.startsWith('-')) {
      // Array item
      const value = trimmed.substring(1).trim();

      // Pop stack to correct level
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const current = stack[stack.length - 1].obj;

      if (!Array.isArray(current)) {
        // Convert to array if needed
        const parent = stack[stack.length - 2].obj;
        const lastKey = Object.keys(parent).pop();
        parent[lastKey] = [current];
        stack[stack.length - 1].obj = parent[lastKey];
      }

      if (Array.isArray(current)) {
        current.push(value.replace(/['"]/g, ''));
      }
    }
  }

  return result;
}

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1];
      params[key] = value;
      i++;
    }
  }

  return params;
}

// Recursively find all YAML files in a directory
function findYamlFiles(dir, maxDepth = 5, currentDepth = 0) {
  const yamlFiles = [];

  if (currentDepth > maxDepth) {
    return yamlFiles;
  }

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip node_modules, .git, and other common directories
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'vendor'].includes(entry.name)) {
          yamlFiles.push(...findYamlFiles(fullPath, maxDepth, currentDepth + 1));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.yml' || ext === '.yaml') {
          yamlFiles.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Ignore permission errors or non-existent directories
  }

  return yamlFiles;
}

// Parse YAML file and check for Bridge CLI configuration
function parseBridgeConfig(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = parseSimpleYaml(content);

    if (!data || typeof data !== 'object') {
      return null;
    }

    // Check if this YAML contains Bridge CLI configuration
    // Look for data.polaris, data.blackducksca, data.coverity, data.srm
    const bridgeConfig = {};

    if (data.data) {
      // Direct Bridge CLI input format
      if (data.data.polaris) {
        bridgeConfig.polaris = extractPolarisConfig(data.data.polaris);
      }
      if (data.data.blackducksca) {
        bridgeConfig.blackducksca = extractBlackDuckConfig(data.data.blackducksca);
      }
      if (data.data.coverity) {
        bridgeConfig.coverity = extractCoverityConfig(data.data.coverity);
      }
      if (data.data.srm) {
        bridgeConfig.srm = extractSrmConfig(data.data.srm);
      }
    }

    // Also check for top-level polaris/blackducksca/coverity/srm keys
    if (data.polaris) {
      bridgeConfig.polaris = extractPolarisConfig(data.polaris);
    }
    if (data.blackducksca) {
      bridgeConfig.blackducksca = extractBlackDuckConfig(data.blackducksca);
    }
    if (data.coverity) {
      bridgeConfig.coverity = extractCoverityConfig(data.coverity);
    }
    if (data.srm) {
      bridgeConfig.srm = extractSrmConfig(data.srm);
    }

    // Check for CI/CD workflow format with BRIDGE_* environment variables
    // Works for GitHub Actions, GitLab CI, Bitbucket Pipelines, ADO, etc.
    const cicdConfig = extractBridgeEnvVars(data);
    if (cicdConfig) {
      Object.assign(bridgeConfig, cicdConfig);
    }

    if (Object.keys(bridgeConfig).length > 0) {
      return {
        filePath: path.relative(process.cwd(), filePath),
        config: bridgeConfig
      };
    }

    return null;
  } catch (error) {
    // Skip files that can't be parsed
    return null;
  }
}

// Extract BRIDGE_* environment variables from CI/CD workflow files
// Works for GitHub Actions, GitLab CI, Bitbucket Pipelines, Azure DevOps, Jenkins, etc.
function extractBridgeEnvVars(data) {
  const envVars = {};

  // Recursively search for env/environment/variables sections
  function searchForEnvVars(obj) {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      const value = obj[key];

      // Check if this is an env/environment/variables section
      if ((key === 'env' || key === 'environment' || key === 'variables') && typeof value === 'object') {
        // Extract all BRIDGE_* environment variables
        for (const envKey in value) {
          if (envKey.startsWith('BRIDGE_')) {
            envVars[envKey] = value[envKey];
          }
        }
      }

      // Recursively search nested objects
      if (typeof value === 'object') {
        searchForEnvVars(value);
      }
    }
  }

  searchForEnvVars(data);

  if (Object.keys(envVars).length === 0) {
    return null;
  }

  // Convert BRIDGE_* env vars to Bridge CLI configuration
  const bridgeConfig = {};

  // Check for Polaris configuration
  if (envVars.BRIDGE_POLARIS_SERVERURL || envVars.BRIDGE_POLARIS_ACCESSTOKEN) {
    const polarisConfig = {
      type: 'polaris',
      found: true
    };

    // Basic configuration
    if (envVars.BRIDGE_POLARIS_SERVERURL) {
      polarisConfig.serverUrl = envVars.BRIDGE_POLARIS_SERVERURL;
    }
    if (envVars.BRIDGE_POLARIS_ACCESSTOKEN) {
      polarisConfig.accessToken = envVars.BRIDGE_POLARIS_ACCESSTOKEN;
    }
    if (envVars.BRIDGE_POLARIS_APPLICATION_NAME) {
      polarisConfig.applicationName = envVars.BRIDGE_POLARIS_APPLICATION_NAME;
    }
    if (envVars.BRIDGE_POLARIS_PROJECT_NAME) {
      polarisConfig.projectName = envVars.BRIDGE_POLARIS_PROJECT_NAME;
    }
    if (envVars.BRIDGE_POLARIS_BRANCH_NAME) {
      polarisConfig.branchName = envVars.BRIDGE_POLARIS_BRANCH_NAME;
    }
    if (envVars.BRIDGE_POLARIS_BRANCH_PARENT_NAME) {
      polarisConfig.parentBranchName = envVars.BRIDGE_POLARIS_BRANCH_PARENT_NAME;
    }

    // Assessment types
    if (envVars.BRIDGE_POLARIS_ASSESSMENT_TYPES) {
      // Parse comma-separated or space-separated assessment types
      const types = envVars.BRIDGE_POLARIS_ASSESSMENT_TYPES
        .toString()
        .split(/[,\s]+/)
        .map(t => t.trim())
        .filter(t => t);
      polarisConfig.assessmentTypes = types;
    }

    // SCA configuration
    if (envVars.BRIDGE_POLARIS_TEST_SCA_TYPE) {
      polarisConfig.scaType = envVars.BRIDGE_POLARIS_TEST_SCA_TYPE;
    }
    if (envVars.BRIDGE_POLARIS_TEST_SCA_LOCATION) {
      polarisConfig.scaLocation = envVars.BRIDGE_POLARIS_TEST_SCA_LOCATION;
    }

    // SAST configuration
    if (envVars.BRIDGE_POLARIS_TEST_SAST_TYPE) {
      polarisConfig.sastType = envVars.BRIDGE_POLARIS_TEST_SAST_TYPE;
    }

    // Wait for scan
    if (envVars.BRIDGE_POLARIS_WAITFORSCAN !== undefined) {
      polarisConfig.waitForScan = envVars.BRIDGE_POLARIS_WAITFORSCAN === 'true' || envVars.BRIDGE_POLARIS_WAITFORSCAN === true;
    }

    // SARIF report configuration
    if (envVars.BRIDGE_POLARIS_REPORTS_SARIF_CREATE !== undefined) {
      polarisConfig.sarifCreate = envVars.BRIDGE_POLARIS_REPORTS_SARIF_CREATE === 'true' || envVars.BRIDGE_POLARIS_REPORTS_SARIF_CREATE === true;
    }
    if (envVars.BRIDGE_POLARIS_REPORTS_SARIF_FILE_PATH) {
      polarisConfig.sarifFilePath = envVars.BRIDGE_POLARIS_REPORTS_SARIF_FILE_PATH;
    }
    if (envVars.BRIDGE_POLARIS_REPORTS_SARIF_GROUPSCAISSUES !== undefined) {
      polarisConfig.sarifGroupScaIssues = envVars.BRIDGE_POLARIS_REPORTS_SARIF_GROUPSCAISSUES === 'true' || envVars.BRIDGE_POLARIS_REPORTS_SARIF_GROUPSCAISSUES === true;
    }
    if (envVars.BRIDGE_POLARIS_REPORTS_SARIF_SEVERITIES) {
      polarisConfig.sarifSeverities = envVars.BRIDGE_POLARIS_REPORTS_SARIF_SEVERITIES;
    }
    if (envVars.BRIDGE_POLARIS_REPORTS_SARIF_ISSUE_TYPES) {
      polarisConfig.sarifIssueTypes = envVars.BRIDGE_POLARIS_REPORTS_SARIF_ISSUE_TYPES;
    }

    // Prcomment configuration
    if (envVars.BRIDGE_POLARIS_PRCOMMENT_ENABLED !== undefined) {
      polarisConfig.prCommentEnabled = envVars.BRIDGE_POLARIS_PRCOMMENT_ENABLED === 'true' || envVars.BRIDGE_POLARIS_PRCOMMENT_ENABLED === true;
    }
    if (envVars.BRIDGE_POLARIS_PRCOMMENT_SEVERITIES) {
      polarisConfig.prCommentSeverities = envVars.BRIDGE_POLARIS_PRCOMMENT_SEVERITIES;
    }

    bridgeConfig.polaris = polarisConfig;
  }

  // Check for Black Duck SCA configuration
  if (envVars.BRIDGE_BLACKDUCKSCA_URL || envVars.BRIDGE_BLACKDUCKSCA_TOKEN) {
    const bdConfig = {
      type: 'blackducksca',
      found: true
    };

    if (envVars.BRIDGE_BLACKDUCKSCA_URL) {
      bdConfig.url = envVars.BRIDGE_BLACKDUCKSCA_URL;
    }
    if (envVars.BRIDGE_BLACKDUCKSCA_TOKEN) {
      bdConfig.token = envVars.BRIDGE_BLACKDUCKSCA_TOKEN;
    }
    if (envVars.BRIDGE_BLACKDUCKSCA_SCAN_FULL !== undefined) {
      bdConfig.scanType = envVars.BRIDGE_BLACKDUCKSCA_SCAN_FULL === 'true' ? 'full' : 'incremental';
    }

    bridgeConfig.blackducksca = bdConfig;
  }

  // Check for Coverity configuration
  if (envVars.BRIDGE_COVERITY_CONNECT_URL || envVars.BRIDGE_COVERITY_CONNECT_USER_NAME) {
    const covConfig = {
      type: 'coverity',
      found: true
    };

    if (envVars.BRIDGE_COVERITY_CONNECT_URL) {
      covConfig.url = envVars.BRIDGE_COVERITY_CONNECT_URL;
    }
    if (envVars.BRIDGE_COVERITY_CONNECT_USER_NAME) {
      covConfig.username = envVars.BRIDGE_COVERITY_CONNECT_USER_NAME;
    }
    if (envVars.BRIDGE_COVERITY_CONNECT_USER_PASSWORD) {
      covConfig.password = envVars.BRIDGE_COVERITY_CONNECT_USER_PASSWORD;
    }
    if (envVars.BRIDGE_COVERITY_CONNECT_PROJECT_NAME) {
      covConfig.projectName = envVars.BRIDGE_COVERITY_CONNECT_PROJECT_NAME;
    }
    if (envVars.BRIDGE_COVERITY_CONNECT_STREAM_NAME) {
      covConfig.streamName = envVars.BRIDGE_COVERITY_CONNECT_STREAM_NAME;
    }

    bridgeConfig.coverity = covConfig;
  }

  return Object.keys(bridgeConfig).length > 0 ? bridgeConfig : null;
}

// Extract Polaris configuration
function extractPolarisConfig(polarisData) {
  const config = {
    type: 'polaris',
    found: true
  };

  if (polarisData.serverUrl) {
    config.serverUrl = polarisData.serverUrl;
  }
  if (polarisData.application?.name) {
    config.applicationName = polarisData.application.name;
  }
  if (polarisData.project?.name) {
    config.projectName = polarisData.project.name;
  }
  if (polarisData.assessment?.types) {
    config.assessmentTypes = polarisData.assessment.types;
  }
  if (polarisData.branch?.name) {
    config.branchName = polarisData.branch.name;
  }

  return config;
}

// Extract Black Duck SCA configuration
function extractBlackDuckConfig(blackduckData) {
  const config = {
    type: 'blackducksca',
    found: true
  };

  if (blackduckData.url) {
    config.url = blackduckData.url;
  }
  if (blackduckData.scan?.full !== undefined) {
    config.scanType = blackduckData.scan.full ? 'full' : 'incremental';
  }

  return config;
}

// Extract Coverity configuration
function extractCoverityConfig(coverityData) {
  const config = {
    type: 'coverity',
    found: true
  };

  if (coverityData.connect?.url) {
    config.url = coverityData.connect.url;
  }
  if (coverityData.connect?.user?.name) {
    config.username = coverityData.connect.user.name;
  }
  if (coverityData.connect?.project?.name) {
    config.projectName = coverityData.connect.project.name;
  }
  if (coverityData.connect?.stream?.name) {
    config.streamName = coverityData.connect.stream.name;
  }
  if (coverityData.build?.command) {
    config.buildCommand = coverityData.build.command;
  }
  if (coverityData.clean?.command) {
    config.cleanCommand = coverityData.clean.command;
  }

  return config;
}

// Extract SRM configuration
function extractSrmConfig(srmData) {
  const config = {
    type: 'srm',
    found: true
  };

  if (srmData.url) {
    config.url = srmData.url;
  }
  if (srmData.assessment?.types) {
    config.assessmentTypes = srmData.assessment.types;
  }
  if (srmData.project?.name) {
    config.projectName = srmData.project.name;
  }
  if (srmData.project?.id) {
    config.projectId = srmData.project.id;
  }
  if (srmData.branch?.name) {
    config.branchName = srmData.branch.name;
  }

  return config;
}

// Main function
function main() {
  const params = parseArgs();

  if (!params.directory) {
    console.error(JSON.stringify({
      success: false,
      error: 'Missing required parameter: --directory'
    }));
    process.exit(1);
  }

  const directory = path.resolve(params.directory);

  if (!fs.existsSync(directory)) {
    console.error(JSON.stringify({
      success: false,
      error: `Directory not found: ${directory}`
    }));
    process.exit(1);
  }

  // Find all YAML files
  const yamlFiles = findYamlFiles(directory);

  // Parse each YAML file for Bridge CLI configuration
  const detectedConfigs = [];

  for (const yamlFile of yamlFiles) {
    const config = parseBridgeConfig(yamlFile);
    if (config) {
      detectedConfigs.push(config);
    }
  }

  // Output results
  const result = {
    success: true,
    directory: directory,
    scannedFiles: yamlFiles.length,
    detectedConfigs: detectedConfigs,
    scanTypes: []
  };

  // Extract unique scan types
  const scanTypes = new Set();
  for (const detected of detectedConfigs) {
    for (const scanType of Object.keys(detected.config)) {
      scanTypes.add(scanType);
    }
  }
  result.scanTypes = Array.from(scanTypes);

  console.log(JSON.stringify(result, null, 2));
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { findYamlFiles, parseBridgeConfig };
