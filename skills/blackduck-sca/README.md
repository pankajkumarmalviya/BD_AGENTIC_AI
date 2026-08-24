# Black Duck SCA Skill

Dedicated Black Duck SCA scanner with streamlined workflow.

## What It Does

This skill:
1. Skips scan type selection - always runs Black Duck SCA
2. Auto-detects YAML configuration
3. Loads stored credentials or asks once
4. Runs Black Duck SCA scan (full or incremental)
5. Optional Fix PR automation
6. Shows results with vulnerability breakdown

## Usage

```
/blackduck-sca
```

The skill will:
- Auto-detect settings from CI/CD YAML files (if exists)
- Use stored credentials from ~/credentials.json
- Ask for scan type (incremental vs full)
- Run Black Duck SCA analysis
- Optionally create fix PRs automatically
- Show detailed results with license risks

## Difference from /blackduck-init

**Use `/blackduck-sca` when:**
- ✅ You always run Black Duck SCA scans
- ✅ You want faster workflow (no scan type selection)
- ✅ You work on SCA-only projects

**Use `/blackduck-init` when:**
- You want to choose between Polaris/SCA/Coverity/SRM
- You work on multi-scanner projects

## Features

- **YAML Auto-Detection**: Reads GitHub Actions, GitLab CI, Bitbucket, Azure DevOps, etc.
- **Credential Storage**: Stores URL/token in ~/credentials.json
- **Incremental Scans**: Fast, scans only changes since last scan
- **Full Scans**: Complete dependency analysis
- **License Analysis**: Automatically detects open source licenses
- **Policy Violations**: Flags components that violate organizational policies
- **Fix PR Automation**: Bridge CLI creates PRs automatically
- **SARIF Reports**: Generates SARIF for IDE integration
- **Multi-Platform**: Works on macOS, Linux, Windows

## Example

```
You: /blackduck-sca

AI: ⏳ Initializing Black Duck SCA scan...
    ⏳ Detecting project settings...

    Which scan type would you like to run?
    • Incremental scan (Recommended - faster, scans only changes)
    • Full scan (Complete analysis of all dependencies)

    You: Incremental

    ⏳ Running Black Duck SCA analysis...

    ✅ Scan completed!

    📊 Black Duck SCA Results
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Status: ✅ Completed

    Vulnerability Breakdown:
    🔴 Critical: 3
    🟠 High: 12
    🟡 Medium: 45
    🔵 Low: 18

    Total Vulnerabilities: 78

    📜 License Risks: 5
    ⚠️  Policy Violations: 2

    🔗 View Details: https://blackduck.example.com/...
```

## Requirements

- Bridge CLI installed (auto-installed by installer)
- Black Duck server URL and API token
- Internet connection to Black Duck server

## Scan Types

### Incremental Scan (Recommended)
- Fast, scans only changes since last scan
- Ideal for continuous development
- Requires previous scan to exist

### Full Scan
- Complete analysis of all dependencies
- Recommended for first scan or major changes
- Takes longer but comprehensive

## Workflow Integration

Complete workflow:
1. `/blackduck-sca` → Run SCA scan
2. Review results in Black Duck web UI
3. Check license risks and policy violations
4. Use Fix PR feature or manual remediation
5. `/blackduck-sca` → Re-scan to verify

## License Analysis

Black Duck SCA automatically:
- Detects open source licenses in dependencies
- Flags policy violations
- Shows license risks (copyleft, restricted, etc.)
- Helps ensure compliance with organizational policies

## Policy Management

- Enforces organizational policies
- Flags components that violate policies
- Shows policy violation details in results
- Helps maintain security and compliance standards
