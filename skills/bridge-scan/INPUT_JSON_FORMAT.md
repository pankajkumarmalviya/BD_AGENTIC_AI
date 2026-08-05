# Bridge CLI Input JSON Format Reference

This document describes the input.json formats accepted by Bridge CLI for different security products.

## Supported Products

1. **Polaris** - SAST/SCA analysis (`polaris_input.json`)
2. **Black Duck SCA** - Software Composition Analysis (`bd_input.json`)
3. **Coverity** - Static analysis (`coverity_input.json`)
4. **SRM** - Security Risk Management (`srm_input.json`)

---

## 1. Polaris Input JSON

**File Name:** `polaris_input.json`

**Bridge CLI Command:**
```bash
--stage polaris --input "polaris_input.json" --out "polaris_output.json"
```

### Complete Structure

```json
{
  "data": {
    "polaris": {
      "accesstoken": "string - REQUIRED: Polaris access token",
      "serverUrl": "string - REQUIRED: Polaris server URL",
      "application": {
        "name": "string - REQUIRED: Application name"
      },
      "project": {
        "name": "string - REQUIRED: Project name"
      },
      "assessment": {
        "types": ["string array - REQUIRED: Assessment types (e.g., SCA, SAST)"],
        "mode": "string - OPTIONAL: Assessment mode (CI, SOURCE_UPLOAD, SOURCEUPLOAD)"
      },
      "branch": {
        "name": "string - OPTIONAL: Branch name",
        "parent": {
          "name": "string - OPTIONAL: Parent branch name"
        }
      },
      "test": {
        "sca": {
          "type": "string - OPTIONAL: SCA test type",
          "location": "string - OPTIONAL: SCA test location"
        },
        "sast": {
          "type": ["string array - OPTIONAL: SAST test types"],
          "location": "string - OPTIONAL: SAST test location"
        }
      },
      "waitForScan": "boolean - OPTIONAL: Wait for scan completion",
      "artifactToUpload": "string - OPTIONAL: Path to artifact to upload",
      "container": {
        "name": "string - OPTIONAL: Container name for container scanning"
      },
      "prcomment": {
        "enabled": "boolean - Enable PR comments",
        "severities": ["string array - OPTIONAL: Filter PR comments by severities"]
      },
      "fixpr": {
        "enabled": "boolean - Enable Fix PR feature",
        "maxCount": "number - OPTIONAL: Maximum number of fix PRs to create",
        "useUpgradeGuidance": ["string array - OPTIONAL: Upgrade guidance options"],
        "filter": {
          "severities": ["string array - OPTIONAL: Filter fixes by severity"]
        }
      },
      "reports": {
        "sarif": {
          "create": "boolean - OPTIONAL: Create SARIF report",
          "file": {
            "path": "string - OPTIONAL: SARIF file output path"
          },
          "severities": ["string array - OPTIONAL: Filter SARIF results by severity"],
          "groupSCAIssues": "boolean - OPTIONAL: Group SCA issues in SARIF report",
          "issue": {
            "types": ["string array - OPTIONAL: Filter SARIF by issue types"]
          }
        }
      }
    },
    "project": {
      "directory": "string - OPTIONAL: Project directory path",
      "source": {
        "archive": "string - OPTIONAL: Source archive path",
        "preserveSymLinks": "boolean - OPTIONAL: Preserve symbolic links",
        "excludes": ["string array - OPTIONAL: File/directory exclusion patterns"]
      }
    },
    "coverity": {
      "build": {
        "command": "string - OPTIONAL: Build command for Coverity analysis"
      },
      "clean": {
        "command": "string - OPTIONAL: Clean command for Coverity analysis"
      },
      "config": {
        "path": "string - OPTIONAL: Coverity config file path"
      },
      "version": "string - OPTIONAL: Coverity version to use",
      "args": "string - OPTIONAL: Additional Coverity command-line arguments"
    },
    "detect": {
      "search": {
        "depth": "number - OPTIONAL: Black Duck Detect search depth"
      },
      "config": {
        "path": "string - OPTIONAL: Black Duck Detect config file path"
      },
      "args": "string - OPTIONAL: Additional Detect command-line arguments"
    },
    "azure": {
      "api": {
        "url": "string - Azure DevOps instance URL"
      },
      "user": {
        "token": "string - Azure DevOps Personal Access Token"
      },
      "organization": {
        "name": "string - Organization name"
      },
      "project": {
        "name": "string - Project name"
      },
      "repository": {
        "name": "string - Repository name",
        "branch": {
          "name": "string - Branch name"
        },
        "pull": {
          "number": "number - OPTIONAL: Pull request number"
        }
      },
      "restAPIVersion": "string - OPTIONAL: REST API version"
    },
    "bridge": {
      "invoked": {
        "from": "string - Integration identifier"
      }
    },
    "network": {
      "airGap": "boolean - OPTIONAL: Enable airgap mode (no network downloads)",
      "ssl": {
        "cert": {
          "file": "string - OPTIONAL: Custom SSL certificate file path"
        },
        "trustAll": "boolean - OPTIONAL: Trust all SSL certificates"
      }
    }
  }
}
```

### Parameter Details

#### polaris
- **accesstoken**: Authentication token for Polaris
- **serverUrl**: Polaris server URL
- **application.name**: Application identifier
- **project.name**: Project identifier
- **assessment.types**: Array of assessment types, must match regex `^[a-zA-Z]+$`
- **assessment.mode**: Valid values: `CI`, `SOURCE_UPLOAD`, `SOURCEUPLOAD`
- **waitForScan**: Boolean to wait for scan completion
- **prcomment**: Only for pull request scans
- **fixpr**: Only for non-PR scans
- **reports**: Only for non-PR scans

#### project
- **directory**: Working directory for the scan
- **source.archive**: Source code archive path
- **source.preserveSymLinks**: Preserve symbolic links during scan
- **source.excludes**: Array of exclusion patterns

#### coverity
- **build.command**: Build command for Coverity analysis
- **clean.command**: Clean command before analysis
- **config.path**: Coverity configuration file path
- **version**: Specific Coverity version
- **args**: Additional command-line arguments

#### detect
- **search.depth**: Dependency search depth
- **config.path**: Detect configuration file path
- **args**: Additional command-line arguments

#### azure
- Required for PR comments and Fix PR features
- **api.url**: Azure DevOps instance URL
- **user.token**: Personal Access Token for authentication
- **organization.name**: Azure organization
- **project.name**: Azure project
- **repository.name**: Repository name
- **repository.branch.name**: Branch name
- **repository.pull.number**: Pull request ID

#### bridge
- **invoked.from**: Integration identifier (e.g., `ado-cloud`, `ado-ee`, `github-cloud`)

#### network
- **airGap**: When true, Bridge CLI skips downloading tools
- **ssl.cert.file**: Path to custom CA certificate
- **ssl.trustAll**: Disable SSL certificate verification

---

## 2. Black Duck SCA Input JSON

**File Name:** `bd_input.json`

**Bridge CLI Command:**
```bash
--stage blackducksca --input "bd_input.json" --out "bd_output.json"
```

### Complete Structure

```json
{
  "data": {
    "blackducksca": {
      "url": "string - REQUIRED: Black Duck server URL",
      "token": "string - REQUIRED: Black Duck API token",
      "waitForScan": "boolean - OPTIONAL: Wait for scan completion",
      "scan": {
        "full": "boolean - OPTIONAL: Full scan vs incremental",
        "failure": {
          "severities": ["enum array - OPTIONAL: Fail build on these severities"]
        }
      },
      "automation": {
        "prcomment": "boolean - OPTIONAL: Enable PR comments"
      },
      "fixpr": {
        "enabled": "boolean - Enable Fix PR feature",
        "maxCount": "number - OPTIONAL: Max number of fix PRs",
        "createSinglePR": "boolean - OPTIONAL: Create single PR for all fixes",
        "useUpgradeGuidance": ["string array - OPTIONAL: Upgrade guidance filter"],
        "filter": {
          "severities": ["string array - OPTIONAL: Filter fixes by severity"]
        }
      },
      "reports": {
        "sarif": {
          "create": "boolean - OPTIONAL: Create SARIF report",
          "file": {
            "path": "string - OPTIONAL: SARIF file path"
          },
          "severities": ["string array - OPTIONAL: Filter SARIF by severity"],
          "groupSCAIssues": "boolean - OPTIONAL: Group SCA issues"
        }
      }
    },
    "detect": {
      "install": {
        "directory": "string - OPTIONAL: Detect installation directory"
      },
      "search": {
        "depth": "number - OPTIONAL: Search depth for dependency detection"
      },
      "config": {
        "path": "string - OPTIONAL: Detect config file path"
      },
      "args": "string - OPTIONAL: Additional Detect arguments"
    },
    "project": {
      "directory": "string - OPTIONAL: Project directory path"
    },
    "azure": {
      "api": {
        "url": "string - Azure DevOps instance URL"
      },
      "user": {
        "token": "string - Azure DevOps PAT token"
      },
      "organization": {
        "name": "string - Organization name"
      },
      "project": {
        "name": "string - Project name"
      },
      "repository": {
        "name": "string - Repository name",
        "branch": {
          "name": "string - Branch name"
        },
        "pull": {
          "number": "number - OPTIONAL: Pull request number"
        }
      },
      "restAPIVersion": "string - OPTIONAL: REST API version"
    },
    "environment": {
      "scan": {
        "pull": "boolean - OPTIONAL: Pull request scan indicator"
      }
    },
    "bridge": {
      "invoked": {
        "from": "string - Integration identifier"
      }
    },
    "network": {
      "airGap": "boolean - OPTIONAL: Enable airgap mode",
      "ssl": {
        "cert": {
          "file": "string - OPTIONAL: SSL certificate file path"
        },
        "trustAll": "boolean - OPTIONAL: Trust all SSL certificates"
      }
    }
  }
}
```

### Parameter Details

#### blackducksca
- **url**: Black Duck server URL
- **token**: API authentication token
- **waitForScan**: Wait for scan completion before continuing
- **scan.full**: `true` for full scan, `false` for incremental
- **scan.failure.severities**: Valid values:
  - `ALL` - Fail on any severity
  - `NONE` - Never fail
  - `BLOCKER` - Blocker severity
  - `CRITICAL` - Critical severity
  - `MAJOR` - Major severity
  - `MINOR` - Minor severity
  - `OK` - OK status
  - `TRIVIAL` - Trivial severity
  - `UNSPECIFIED` - Unspecified severity
- **automation.prcomment**: Enable PR comments
- **fixpr.enabled**: Enable Fix PR feature
- **fixpr.maxCount**: Maximum fix PRs (cannot be used with `createSinglePR: true`)
- **fixpr.createSinglePR**: Create one PR with all fixes
- **fixpr.useUpgradeGuidance**: Array of upgrade guidance filters
- **fixpr.filter.severities**: Array of severities to filter
- **reports**: Only for non-PR scans

#### detect
- **install.directory**: Black Duck Detect installation directory
- **search.depth**: Dependency search depth (integer)
- **config.path**: Configuration file path
- **args**: Additional command-line arguments

#### environment
- **scan.pull**: Indicates pull request scan

---

## 3. Coverity Input JSON

**File Name:** `coverity_input.json`

**Bridge CLI Command:**
```bash
--stage connect --input "coverity_input.json"
```

### Complete Structure

```json
{
  "data": {
    "coverity": {
      "connect": {
        "user": {
          "name": "string - REQUIRED: Coverity username",
          "password": "string - REQUIRED: Coverity password"
        },
        "url": "string - REQUIRED: Coverity Connect server URL",
        "project": {
          "name": "string - REQUIRED: Project name"
        },
        "stream": {
          "name": "string - REQUIRED: Stream name"
        },
        "policy": {
          "view": "string - OPTIONAL: Policy view name"
        }
      },
      "local": "boolean - OPTIONAL: Enable local analysis mode",
      "install": {
        "directory": "string - OPTIONAL: Coverity installation directory"
      },
      "waitForScan": "boolean - OPTIONAL: Wait for scan completion",
      "version": "string - OPTIONAL: Coverity version",
      "build": {
        "command": "string - OPTIONAL: Build command"
      },
      "clean": {
        "command": "string - OPTIONAL: Clean command"
      },
      "config": {
        "path": "string - OPTIONAL: Config file path"
      },
      "args": "string - OPTIONAL: Additional arguments",
      "prcomment": {
        "enabled": "boolean - Enable PR comments",
        "impacts": ["string array - OPTIONAL: Filter by impact (HIGH, MEDIUM, LOW)"]
      }
    },
    "project": {
      "directory": "string - OPTIONAL: Project directory path"
    },
    "azure": {
      "api": {
        "url": "string - Azure DevOps instance URL"
      },
      "user": {
        "token": "string - Azure DevOps PAT token"
      },
      "organization": {
        "name": "string - Organization name"
      },
      "project": {
        "name": "string - Project name"
      },
      "repository": {
        "name": "string - Repository name",
        "branch": {
          "name": "string - Branch name"
        },
        "pull": {
          "number": "number - OPTIONAL: Pull request number"
        }
      },
      "restAPIVersion": "string - OPTIONAL: REST API version"
    },
    "environment": {
      "scan": {
        "pull": "boolean - OPTIONAL: Pull request scan indicator"
      }
    },
    "bridge": {
      "invoked": {
        "from": "string - Integration identifier"
      }
    },
    "network": {
      "airGap": "boolean - OPTIONAL: Enable airgap mode",
      "ssl": {
        "cert": {
          "file": "string - OPTIONAL: SSL certificate file path"
        },
        "trustAll": "boolean - OPTIONAL: Trust all SSL certificates"
      }
    }
  }
}
```

### Parameter Details

#### coverity
- **connect.user.name**: Coverity username
- **connect.user.password**: Coverity password
- **connect.url**: Coverity Connect server URL
- **connect.project.name**: Project name
- **connect.stream.name**: Stream name
- **connect.policy.view**: Policy view name
- **local**: Enable local analysis (no server upload)
- **install.directory**: Coverity installation directory
- **waitForScan**: Wait for scan completion
- **version**: Specific Coverity version
- **build.command**: Build command for capture
- **clean.command**: Clean command before analysis
- **config.path**: Configuration file path
- **args**: Additional command-line arguments
- **prcomment.enabled**: Enable PR comments
- **prcomment.impacts**: Array of impact filters (HIGH, MEDIUM, LOW)

#### environment
- **scan.pull**: Indicates pull request scan

---

## 4. SRM Input JSON

**File Name:** `srm_input.json`

**Bridge CLI Command:**
```bash
--stage srm --input "srm_input.json"
```

### Complete Structure

```json
{
  "data": {
    "srm": {
      "url": "string - REQUIRED: SRM server URL",
      "apikey": "string - REQUIRED: SRM API key",
      "assessment": {
        "types": ["string array - REQUIRED: Assessment types"]
      },
      "project": {
        "name": "string - OPTIONAL: Project name",
        "id": "string - OPTIONAL: Project ID"
      },
      "branch": {
        "name": "string - OPTIONAL: Branch name",
        "parent": "string - OPTIONAL: Parent branch name"
      },
      "waitForScan": "boolean - OPTIONAL: Wait for scan completion"
    },
    "coverity": {
      "execution": {
        "path": "string - OPTIONAL: Path to Coverity executable"
      },
      "build": {
        "command": "string - OPTIONAL: Build command"
      },
      "clean": {
        "command": "string - OPTIONAL: Clean command"
      },
      "config": {
        "path": "string - OPTIONAL: Config file path"
      },
      "version": "string - OPTIONAL: Coverity version",
      "args": "string - OPTIONAL: Additional arguments"
    },
    "detect": {
      "execution": {
        "path": "string - OPTIONAL: Path to Detect executable"
      },
      "search": {
        "depth": "number - OPTIONAL: Search depth"
      },
      "config": {
        "path": "string - OPTIONAL: Config file path"
      },
      "args": "string - OPTIONAL: Additional arguments"
    },
    "project": {
      "directory": "string - OPTIONAL: Project directory path"
    },
    "bridge": {
      "invoked": {
        "from": "string - Integration identifier"
      }
    }
  }
}
```

### Parameter Details

#### srm
- **url**: SRM server URL
- **apikey**: SRM API key
- **assessment.types**: Array of assessment types, must match regex `^[a-zA-Z]+$`
- **project.name**: Project name
- **project.id**: Project ID
- **branch.name**: Branch name
- **branch.parent**: Parent branch name
- **waitForScan**: Wait for scan completion

#### coverity
- **execution.path**: Custom path to Coverity executable
- **build.command**: Build command
- **clean.command**: Clean command
- **config.path**: Configuration file path
- **version**: Coverity version
- **args**: Additional arguments

#### detect
- **execution.path**: Custom path to Detect executable
- **search.depth**: Dependency search depth (integer)
- **config.path**: Configuration file path
- **args**: Additional arguments

---

## Common Parameters

### bridge
Present in all input JSON formats.

- **invoked.from**: Identifies the integration source
  - `ado-cloud` - Azure DevOps Cloud
  - `ado-ee` - Azure DevOps Enterprise/On-Premises
  - `github-cloud` - GitHub Cloud
  - `github-ee` - GitHub Enterprise
  - Custom integration identifiers

### network
Present in Polaris, Black Duck SCA, and Coverity formats.

- **airGap**: Boolean, when `true` Bridge CLI operates in airgap mode
  - Skips downloading tools
  - Requires pre-installed tools
- **ssl.cert.file**: Path to custom CA certificate for HTTPS connections
- **ssl.trustAll**: Boolean, disables SSL certificate verification (not recommended)

### azure
Required for PR comment and Fix PR features.

- **api.url**: Azure DevOps instance URL
- **user.token**: Personal Access Token for authentication
- **organization.name**: Organization name
- **project.name**: Project name
- **repository.name**: Repository name
- **repository.branch.name**: Branch name
- **repository.pull.number**: Pull request ID (integer)
- **restAPIVersion**: REST API version (optional, for on-premises instances)

### environment
Used in Black Duck SCA and Coverity for PR scans.

- **scan.pull**: Boolean, indicates pull request scan

### project
Present in all formats.

- **directory**: Project working directory path

---

## Minimal Examples

### Polaris Minimal

```json
{
  "data": {
    "polaris": {
      "accesstoken": "your-token",
      "serverUrl": "https://polaris.example.com",
      "application": { "name": "my-app" },
      "project": { "name": "my-project" },
      "assessment": { "types": ["SCA", "SAST"] },
      "branch": { "parent": {} }
    },
    "bridge": {
      "invoked": { "from": "ado-cloud" }
    }
  }
}
```

### Black Duck SCA Minimal

```json
{
  "data": {
    "blackducksca": {
      "url": "https://blackduck.example.com",
      "token": "your-token"
    },
    "bridge": {
      "invoked": { "from": "ado-cloud" }
    }
  }
}
```

### Coverity Minimal

```json
{
  "data": {
    "coverity": {
      "connect": {
        "user": { "name": "user", "password": "pass" },
        "url": "https://coverity.example.com",
        "project": { "name": "my-project" },
        "stream": { "name": "my-stream" }
      }
    },
    "bridge": {
      "invoked": { "from": "ado-cloud" }
    }
  }
}
```

### SRM Minimal

```json
{
  "data": {
    "srm": {
      "url": "https://srm.example.com",
      "apikey": "your-api-key",
      "assessment": { "types": ["SCA"] },
      "project": { "name": "my-project" }
    },
    "bridge": {
      "invoked": { "from": "ado-cloud" }
    }
  }
}
```

---

## Data Types Reference

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text value | `"my-value"` |
| `boolean` | True or false | `true` or `false` |
| `number` | Integer or decimal | `42` or `3.14` |
| `string array` | Array of strings | `["value1", "value2"]` |
| `enum array` | Array of enum values | `["CRITICAL", "HIGH"]` |

## Validation Rules

### Assessment Types
- Must match regex: `^[a-zA-Z]+$` (alphabetic characters only)
- Examples: `SCA`, `SAST`, `DAST`

### Severities
- Black Duck SCA failure severities: `ALL`, `NONE`, `BLOCKER`, `CRITICAL`, `MAJOR`, `MINOR`, `OK`, `TRIVIAL`, `UNSPECIFIED`
- Coverity PR comment impacts: `HIGH`, `MEDIUM`, `LOW`

### Assessment Modes
- Valid values: `CI`, `SOURCE_UPLOAD`, `SOURCEUPLOAD`

### Boolean Values
- Must be exactly `true` or `false` (lowercase)

### Integer Values
- Must be valid integers
- Examples: `search.depth`, `fixpr.maxCount`, `repository.pull.number`
