#!/usr/bin/env node

/**
 * Bridge CLI Input JSON Generator
 *
 * Generates validated input.json files for Bridge CLI based on user inputs.
 * Prevents AI hallucination and ensures correct JSON structure.
 */

const fs = require('fs');
const path = require('path');

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
          from: 'bridge-cli-skill'
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

  if (params['sarif-report'] === 'true') {
    input.data.polaris.reports = {
      sarif: {
        create: true,
        file: {
          path: params['sarif-path'] || 'polaris-results.sarif'
        }
      }
    };
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
          from: 'bridge-cli-skill'
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
          from: 'bridge-cli-skill'
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
          from: 'bridge-cli-skill'
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

// Generate Signal (AI) input.json
function generateSignalInput(params) {
  const input = {
    data: {
      ai: {
        gatewayUrl: params['gateway-url'] || 'https://llm.labs.blackduck.com',
        gatewayKey: params['gateway-key']
      },
      project: {
        directory: params.directory || process.cwd()
      },
      bridge: {
        invoked: {
          from: 'bridge-cli-skill'
        }
      }
    }
  };

  // Optional: Upload to Polaris
  if (params['polaris-url'] && params['polaris-token']) {
    input.data.polaris = {
      serverUrl: params['polaris-url'],
      accesstoken: params['polaris-token']
    };

    if (params['project-name']) {
      input.data.polaris.project = {
        name: params['project-name']
      };
    }

    if (params['app-name']) {
      input.data.polaris.application = {
        name: params['app-name']
      };
    }
  }

  // Timeout setting
  if (params.timeout) {
    input.data.ai.timeout = parseInt(params.timeout);
  }

  // Wait for scan
  if (params['wait-for-scan'] === 'true') {
    input.data.ai.waitForScan = true;
  }

  // SARIF report
  if (params['sarif-report'] === 'true') {
    input.data.ai.reports = {
      sarif: {
        create: true,
        file: {
          path: params['sarif-path'] || 'signal-results.sarif'
        }
      }
    };
  }

  return input;
}

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

    case 'signal':
      if (!params['gateway-key']) errors.push('--gateway-key is required');
      break;

    default:
      errors.push(`Unknown stage: ${stage}`);
  }

  return errors;
}

// Main
function main() {
  const params = parseArgs();
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
  signal        - Black Duck Signal (AI-powered analysis)

Common Options:
  --output <file>           Output file path (default: <stage>_input.json)
  --directory <path>        Project directory to scan
  --wait-for-scan           Wait for scan completion
  --sarif-report            Generate SARIF report
  --sarif-path <file>       SARIF report path

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

Signal Options:
  --gateway-url <url>       Signal gateway URL (default: https://llm.labs.blackduck.com)
  --gateway-key <key>       Signal gateway API key (required)
  --polaris-url <url>       Polaris server URL (optional, for uploading results)
  --polaris-token <token>   Polaris access token (optional, for uploading results)
  --project-name <name>     Project name (optional)
  --app-name <name>         Application name (optional)
  --timeout <ms>            Scan timeout in milliseconds (default: 1800000)

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
    case 'signal':
      inputJson = generateSignalInput(params);
      break;
    default:
      console.error(`Unknown stage: ${stage}`);
      process.exit(1);
  }

  // Write to file
  const outputFile = params.output || `${stage}_input.json`;
  fs.writeFileSync(outputFile, JSON.stringify(inputJson, null, 2));

  console.log(`✓ Generated ${outputFile}`);
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
