# Black Duck Polaris Skill

Dedicated Polaris SAST+SCA scanner with streamlined workflow.

## What It Does

This skill:
1. Skips scan type selection - always runs Polaris
2. Auto-detects YAML configuration
3. Loads stored credentials or asks once
4. Runs Polaris SAST+SCA scan
5. Optional Fix PR automation
6. Shows results with severity breakdown

## Usage

```
/blackduck-polaris
```

The skill will:
- Auto-detect settings from polaris.yml (if exists)
- Use stored credentials from ~/credentials.json
- Run Polaris scan with SCA+SAST
- Optionally create fix PRs automatically
- Show detailed results

## Difference from /blackduck-init

**Use `/blackduck-polaris` when:**
- ✅ You always run Polaris scans
- ✅ You want faster workflow (no scan type selection)
- ✅ You work on Polaris-only projects

**Use `/blackduck-init` when:**
- You want to choose between Polaris/SCA/Coverity/SRM
- You work on multi-scanner projects

## Features

- **YAML Auto-Detection**: Reads polaris.yml, GitHub Actions, GitLab CI, etc.
- **Credential Storage**: Stores URL/token in ~/credentials.json
- **Fix PR Automation**: Bridge CLI creates PRs automatically
- **SARIF Reports**: Generates SARIF for IDE integration
- **Multi-Platform**: Works on macOS, Linux, Windows

## Example

```
You: /blackduck-polaris

AI: ⏳ Initializing Polaris scan...
    ⏳ Detecting project settings...
    ⏳ Running Polaris SAST+SCA analysis...

    ✅ Scan completed!

    📊 Polaris Scan Results
    ━━━━━━━━━━━━━━━━━━━━━━━
    Status: ✅ Completed

    Issue Breakdown:
    🔴 Critical: 3
    🟠 High: 12
    🟡 Medium: 45
    🔵 Low: 18

    Total Issues: 78

    🔗 View Details: https://poc.polaris.blackduck.com/...
```

## Requirements

- Bridge CLI installed (auto-installed by installer)
- Polaris server URL and access token
- Internet connection to Polaris server

## Workflow Integration

Complete workflow:
1. `/blackduck-polaris` → Run Polaris scan
2. `/blackduck-remediate` → Fetch detailed issues
3. `/blackduck-triage` → Apply fixes
4. `/blackduck-polaris` → Re-scan to verify
