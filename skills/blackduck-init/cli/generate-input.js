#!/usr/bin/env node

/**
 * Bridge CLI Input JSON Generator
 *
 * Generates validated input.json files for Bridge CLI based on user inputs.
 * Prevents AI hallucination and ensures correct JSON structure.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Path to credentials file directly in user's home directory
const CREDENTIALS_FILE = path.join(os.homedir(), 'credentials.json');

// Load credentials from file
function loadCredentials() {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const content = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
      const creds = JSON.parse(content);
      return creds;
    }
  } catch (error) {
    console.error(`Warning: Could not load credentials: ${error.message}`);
  }
  return null;
}

// Save configuration (credentials + assessment types/scan settings) to file
// NOTE: Project/application names and branch names are NOT stored - they are auto-detected from directory/git
function saveCredentials(stage, params) {
  try {
    let creds = loadCredentials() || {
      lastUsedScanType: "",
      polaris: { serverUrl: "", accessToken: "", assessmentTypes: [] },
      blackducksca: { url: "", token: "", scanType: "" },
      coverity: { url: "", username: "", password: "", streamName: "", buildCommand: "", cleanCommand: "" },
      srm: { url: "", apiKey: "", assessmentTypes: [] }
    };

    // Save the last used scan type
    creds.lastUsedScanType = stage;

    switch (stage) {
      case 'polaris':
        creds.polaris = {
          serverUrl: params['server-url'],
          accessToken: params['access-token'] || params.token,
          assessmentTypes: params['assessment-types'] ? params['assessment-types'].split(',') : []
        };
        break;
      case 'blackducksca':
        creds.blackducksca = {
          url: params['server-url'],
          token: params.token || params['api-token'],
          scanType: params['full-scan'] === 'true' ? 'full' : 'incremental'
        };
        break;
      case 'coverity':
        creds.coverity = {
          url: params['server-url'],
          username: params.username,
          password: params.password,
          streamName: params['stream-name'] || "",
          buildCommand: params['build-command'] || "",
          cleanCommand: params['clean-command'] || ""
        };
        break;
      case 'srm':
        creds.srm = {
          url: params['server-url'],
          apiKey: params['api-key'] || params.apikey,
          assessmentTypes: params['assessment-types'] ? params['assessment-types'].split(',') : []
        };
        break;
    }

    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2));
    console.log(`✓ Configuration saved to ${CREDENTIALS_FILE}`);
    return true;
  } catch (error) {
    console.error(`Warning: Could not save configuration: ${error.message}`);
    return false;
  }
}

// Merge configuration (credentials + settings) from file into params
// NOTE: Project/application names and branch names are NOT merged - they are auto-detected from directory/git
function mergeCredentials(stage, params) {
  const creds = loadCredentials();
  if (!creds) return params;

  const merged = { ...params };

  switch (stage) {
    case 'polaris':
      if (creds.polaris?.serverUrl && !merged['server-url']) {
        merged['server-url'] = creds.polaris.serverUrl;
      }
      if (creds.polaris?.accessToken && !merged['access-token'] && !merged.token) {
        merged['access-token'] = creds.polaris.accessToken;
      }
      if (creds.polaris?.assessmentTypes && creds.polaris.assessmentTypes.length > 0 && !merged['assessment-types']) {
        merged['assessment-types'] = creds.polaris.assessmentTypes.join(',');
      }
      break;
    case 'blackducksca':
      if (creds.blackducksca?.url && !merged['server-url']) {
        merged['server-url'] = creds.blackducksca.url;
      }
      if (creds.blackducksca?.token && !merged.token && !merged['api-token']) {
        merged.token = creds.blackducksca.token;
      }
      if (creds.blackducksca?.scanType && !merged['full-scan']) {
        merged['full-scan'] = creds.blackducksca.scanType === 'full' ? 'true' : 'false';
      }
      break;
    case 'coverity':
      if (creds.coverity?.url && !merged['server-url']) {
        merged['server-url'] = creds.coverity.url;
      }
      if (creds.coverity?.username && !merged.username) {
        merged.username = creds.coverity.username;
      }
      if (creds.coverity?.password && !merged.password) {
        merged.password = creds.coverity.password;
      }
      if (creds.coverity?.streamName && !merged['stream-name']) {
        merged['stream-name'] = creds.coverity.streamName;
      }
      if (creds.coverity?.buildCommand && !merged['build-command']) {
        merged['build-command'] = creds.coverity.buildCommand;
      }
      if (creds.coverity?.cleanCommand && !merged['clean-command']) {
        merged['clean-command'] = creds.coverity.cleanCommand;
      }
      break;
    case 'srm':
      if (creds.srm?.url && !merged['server-url']) {
        merged['server-url'] = creds.srm.url;
      }
      if (creds.srm?.apiKey && !merged['api-key'] && !merged.apikey) {
        merged['api-key'] = creds.srm.apiKey;
      }
      if (creds.srm?.assessmentTypes && creds.srm.assessmentTypes.length > 0 && !merged['assessment-types']) {
        merged['assessment-types'] = creds.srm.assessmentTypes.join(',');
      }
      break;
  }

  return merged;
}

// Parse command line arguments
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

// Generate Polaris input.json
function generatePolarisInput(params) {
  const input = {
    data: {
      polaris: {
        accesstoken: params['access-token'] || params.token,
        serverUrl: params['server-url'],
        application: {
          name: params['app-name'] || params['application-name']
        },
        project: {
          name: params['project-name']
        },
        assessment: {
          types: (params['assessment-types'] || 'SCA').split(',')
        }
      },
      project: {
        directory: params.directory || process.cwd()
      },
      bridge: {
        invoked: {
          from: 'blackduck-init'
        }
      }
    }
  };

  // Add optional fields
  if (params['branch-name']) {
    input.data.polaris.branch = {
      name: params['branch-name']
    };
    if (params['parent-branch']) {
      input.data.polaris.branch.parent = {
        name: params['parent-branch']
      };
    }
  }

  if (params['wait-for-scan'] === 'true') {
    input.data.polaris.waitForScan = true;
  }

  // SCA configuration
  if (params['sca-type']) {
    if (!input.data.polaris.test) input.data.polaris.test = {};
    if (!input.data.polaris.test.sca) input.data.polaris.test.sca = {};
    input.data.polaris.test.sca.type = params['sca-type'];
  }
  if (params['sca-location']) {
    if (!input.data.polaris.test) input.data.polaris.test = {};
    if (!input.data.polaris.test.sca) input.data.polaris.test.sca = {};
    input.data.polaris.test.sca.location = params['sca-location'];
  }

  // SAST configuration
  if (params['sast-type']) {
    if (!input.data.polaris.test) input.data.polaris.test = {};
    if (!input.data.polaris.test.sast) input.data.polaris.test.sast = {};
    input.data.polaris.test.sast.type = params['sast-type'];
  }

  // SARIF report configuration
  if (params['sarif-report'] === 'true') {
    input.data.polaris.reports = {
      sarif: {
        create: true,
        file: {
          path: params['sarif-path'] || 'polaris-results.sarif'
        }
      }
    };

    // Additional SARIF options
    if (params['sarif-group-sca-issues'] === 'true') {
      input.data.polaris.reports.sarif.groupSCAIssues = true;
    }
    if (params['sarif-severities']) {
      input.data.polaris.reports.sarif.severities = params['sarif-severities'].split(',');
    }
    if (params['sarif-issue-types']) {
      input.data.polaris.reports.sarif.issue = {
        types: params['sarif-issue-types'].split(',')
      };
    }
  }

  // PR comment configuration
  if (params['pr-comment-enabled'] === 'true') {
    input.data.polaris.prComment = {
      enabled: true
    };
    if (params['pr-comment-severities']) {
      input.data.polaris.prComment.severities = params['pr-comment-severities'].split(',');
    }
  }

  // Fix PR configuration
  if (params['fixpr-enabled'] === 'true') {
    input.data.polaris.fixpr = {
      enabled: true
    };

    // Single PR vs multiple PRs
    if (params['fixpr-create-single-pr'] === 'true') {
      input.data.polaris.fixpr.createSinglePR = true;
    } else if (params['fixpr-max-count']) {
      input.data.polaris.fixpr.maxCount = parseInt(params['fixpr-max-count']);
    }

    // Severity filter
    if (params['fixpr-severities']) {
      input.data.polaris.fixpr.filter = {
        severities: params['fixpr-severities'].split(',')
      };
    }

    // Upgrade guidance
    if (params['fixpr-upgrade-guidance']) {
      input.data.polaris.fixpr.useUpgradeGuidance = params['fixpr-upgrade-guidance'].split(',');
    }
  }

  // Git provider configuration for Fix PR
  if (params['git-provider']) {
    const provider = params['git-provider'];

    if (provider === 'github') {
      // GitHub configuration
      input.data.github = {
        user: {
          token: params['git-token']
        }
      };

      // Extract owner/repo from git-repo parameter
      if (params['git-repo']) {
        const [owner, repo] = params['git-repo'].split('/');
        input.data.github.repository = {
          name: repo,
          owner: {
            name: owner
          },
          branch: {
            name: params['branch-name'] || 'main'
          }
        };
      }

      // Set bridge.invoked.from for GitHub
      input.data.bridge.invoked.from = 'github-cloud';

    } else if (provider === 'azure') {
      // Azure DevOps configuration
      input.data.azure = {
        user: {
          token: params['git-token']
        },
        organization: {
          name: params['git-org']
        },
        project: {
          name: params['git-project']
        },
        repository: {
          name: params['git-repo'],
          branch: {
            name: params['branch-name'] || 'main'
          }
        }
      };

      // Set bridge.invoked.from for Azure
      input.data.bridge.invoked.from = 'ado-cloud';

    } else if (provider === 'gitlab') {
      // GitLab configuration
      input.data.gitlab = {
        user: {
          token: params['git-token']
        }
      };

      // Extract owner/repo from git-repo parameter
      if (params['git-repo']) {
        const [owner, repo] = params['git-repo'].split('/');
        input.data.gitlab.repository = {
          name: repo,
          owner: {
            name: owner
          }
        };
      }

      // Set bridge.invoked.from for GitLab
      input.data.bridge.invoked.from = 'gitlab-cloud';
    }
  }

  return input;
}

// Generate Black Duck SCA input.json
function generateBlackDuckInput(params) {
  const input = {
    data: {
      blackducksca: {
        url: params['server-url'],
        token: params.token || params['api-token']
      },
      project: {
        directory: params.directory || process.cwd()
      },
      bridge: {
        invoked: {
          from: 'blackduck-init'
        }
      }
    }
  };

  // Add optional fields
  if (params['wait-for-scan'] === 'true') {
    input.data.blackducksca.waitForScan = true;
  }

  if (params['full-scan'] === 'true') {
    input.data.blackducksca.scan = {
      full: true
    };
  }

  if (params['sarif-report'] === 'true') {
    input.data.blackducksca.reports = {
      sarif: {
        create: true,
        file: {
          path: params['sarif-path'] || 'blackduck-results.sarif'
        }
      }
    };
  }

  return input;
}

// Generate Coverity input.json
function generateCoverityInput(params) {
  const input = {
    data: {
      coverity: {
        connect: {
          user: {
            name: params.username,
            password: params.password
          },
          url: params['server-url'],
          project: {
            name: params['project-name']
          },
          stream: {
            name: params['stream-name']
          }
        }
      },
      project: {
        directory: params.directory || process.cwd()
      },
      bridge: {
        invoked: {
          from: 'blackduck-init'
        }
      }
    }
  };

  // Add optional fields
  if (params['build-command']) {
    input.data.coverity.build = {
      command: params['build-command']
    };
  }

  if (params['clean-command']) {
    input.data.coverity.clean = {
      command: params['clean-command']
    };
  }

  if (params['wait-for-scan'] === 'true') {
    input.data.coverity.waitForScan = true;
  }

  return input;
}

// Generate SRM input.json
function generateSRMInput(params) {
  const input = {
    data: {
      srm: {
        url: params['server-url'],
        apikey: params['api-key'] || params.apikey,
        assessment: {
          types: (params['assessment-types'] || 'SCA').split(',')
        }
      },
      project: {
        directory: params.directory || process.cwd()
      },
      bridge: {
        invoked: {
          from: 'blackduck-init'
        }
      }
    }
  };

  // Add optional fields
  if (params['project-name']) {
    input.data.srm.project = {
      name: params['project-name']
    };
  }

  if (params['project-id']) {
    input.data.srm.project = input.data.srm.project || {};
    input.data.srm.project.id = params['project-id'];
  }

  if (params['branch-name']) {
    input.data.srm.branch = {
      name: params['branch-name']
    };
    if (params['parent-branch']) {
      input.data.srm.branch.parent = params['parent-branch'];
    }
  }

  if (params['wait-for-scan'] === 'true') {
    input.data.srm.waitForScan = true;
  }

  return input;
}

// NOTE: Signal does NOT use input.json - it uses environment variables and CLI arguments
// Signal is handled differently in SKILL.md

// Validate required fields
function validateParams(stage, params) {
  const errors = [];

  switch (stage) {
    case 'polaris':
      if (!params['access-token'] && !params.token) errors.push('--access-token is required');
      if (!params['server-url']) errors.push('--server-url is required');
      if (!params['app-name'] && !params['application-name']) errors.push('--app-name is required');
      if (!params['project-name']) errors.push('--project-name is required');
      break;

    case 'blackducksca':
      if (!params['server-url']) errors.push('--server-url is required');
      if (!params.token && !params['api-token']) errors.push('--token is required');
      break;

    case 'coverity':
      if (!params['server-url']) errors.push('--server-url is required');
      if (!params.username) errors.push('--username is required');
      if (!params.password) errors.push('--password is required');
      if (!params['project-name']) errors.push('--project-name is required');
      if (!params['stream-name']) errors.push('--stream-name is required');
      break;

    case 'srm':
      if (!params['server-url']) errors.push('--server-url is required');
      if (!params['api-key'] && !params.apikey) errors.push('--api-key is required');
      break;

    default:
      errors.push(`Unknown stage: ${stage}`);
  }

  return errors;
}

// Main
function main() {
  let params = parseArgs();
  const stage = params.stage;

  if (!stage || params.help) {
    console.log(`
Bridge CLI Input Generator

Usage:
  node generate-input.js --stage <stage> [options]

Stages:
  polaris       - Polaris SAST/SCA
  blackducksca  - Black Duck SCA
  coverity      - Coverity Connect
  srm           - Security Risk Management

Note: Signal (AI-powered analysis) is supported but uses different workflow (see SKILL.md)

Common Options:
  --output <file>           Output file path (default: <stage>_input.json)
  --directory <path>        Project directory to scan
  --wait-for-scan           Wait for scan completion
  --sarif-report            Generate SARIF report
  --sarif-path <file>       SARIF report path
  --save-credentials        Save credentials to credentials.json (auto-saves on first use)
  --load-credentials false  Disable loading credentials from file (default: true)

Polaris Options:
  --server-url <url>        Polaris server URL (required)
  --access-token <token>    Polaris access token (required)
  --app-name <name>         Application name (required)
  --project-name <name>     Project name (required)
  --assessment-types <types> Assessment types (default: SCA)
  --branch-name <name>      Branch name
  --parent-branch <name>    Parent branch name

Black Duck Options:
  --server-url <url>        Black Duck server URL (required)
  --token <token>           API token (required)
  --full-scan               Run full scan (vs incremental)

Coverity Options:
  --server-url <url>        Coverity Connect URL (required)
  --username <user>         Username (required)
  --password <pass>         Password (required)
  --project-name <name>     Project name (required)
  --stream-name <name>      Stream name (required)
  --build-command <cmd>     Build command
  --clean-command <cmd>     Clean command

SRM Options:
  --server-url <url>        SRM server URL (required)
  --api-key <key>           API key (required)
  --assessment-types <types> Assessment types (default: SCA)
  --project-name <name>     Project name
  --project-id <id>         Project ID
  --branch-name <name>      Branch name
  --parent-branch <name>    Parent branch name

Example:
  node generate-input.js --stage polaris \\
    --server-url https://polaris.example.com \\
    --access-token abc123 \\
    --app-name myapp \\
    --project-name myproject \\
    --sarif-report
`);
    process.exit(params.help ? 0 : 1);
  }

  // Merge credentials from file (if not disabled and credentials exist)
  if (params['load-credentials'] !== 'false') {
    params = mergeCredentials(stage, params);
  }

  // Validate
  const errors = validateParams(stage, params);
  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  // Generate input based on stage
  let inputJson;
  switch (stage) {
    case 'polaris':
      inputJson = generatePolarisInput(params);
      break;
    case 'blackducksca':
      inputJson = generateBlackDuckInput(params);
      break;
    case 'coverity':
      inputJson = generateCoverityInput(params);
      break;
    case 'srm':
      inputJson = generateSRMInput(params);
      break;
    default:
      console.error(`Unknown stage: ${stage}`);
      process.exit(1);
  }

  // Write to file
  const outputFile = params.output || `${stage}_input.json`;
  fs.writeFileSync(outputFile, JSON.stringify(inputJson, null, 2));

  console.log(`✓ Generated ${outputFile}`);

  // Save credentials (always save unless explicitly disabled)
  if (params['save-credentials'] !== 'false') {
    saveCredentials(stage, params);
  }

  console.log(`\nPreview (credentials masked):`);

  // Show masked preview
  const masked = JSON.parse(JSON.stringify(inputJson));
  if (masked.data.polaris?.accesstoken) {
    masked.data.polaris.accesstoken = '***REDACTED***';
  }
  if (masked.data.blackducksca?.token) {
    masked.data.blackducksca.token = '***REDACTED***';
  }
  if (masked.data.coverity?.connect?.user?.password) {
    masked.data.coverity.connect.user.password = '***REDACTED***';
  }
  if (masked.data.srm?.apikey) {
    masked.data.srm.apikey = '***REDACTED***';
  }

  console.log(JSON.stringify(masked, null, 2));
}

main();
