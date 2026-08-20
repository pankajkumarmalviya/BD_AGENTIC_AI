# Bridge CLI Scanner Skill

Interactive AI assistant skill for running Bridge CLI security scans across Polaris, Black Duck SCA, Coverity, and SRM platforms.

## What It Does

When you type `/blackduck-init` in your AI assistant, this skill:

1. **Guides you through** an interactive question flow to collect scan configuration
2. **Generates** the appropriate `input.json` file automatically
3. **Executes** Bridge CLI commands with the correct parameters
4. **Parses and displays** results in an easy-to-read format

## Supported Scan Types

- **Polaris** - SAST/SCA analysis (Static Application Security Testing + Software Composition Analysis)
- **Black Duck SCA** - Software Composition Analysis for open source vulnerabilities
- **Coverity** - Static analysis for code defects
- **SRM** - Security Risk Management

## Features

- ✅ Interactive question-based flow (no need to remember JSON structure)
- ✅ Automatic input.json generation
- ✅ Support for local directory or remote GitHub repository scanning
- ✅ Credential masking for security
- ✅ Formatted result presentation with severity breakdown
- ✅ SARIF report generation
- ✅ Error handling with helpful troubleshooting tips

## Example Usage

```
You: /blackduck-init

AI: Which security scan would you like to run?
    1. Polaris - SAST/SCA analysis
    2. Black Duck SCA - Software Composition Analysis only
    3. Coverity - Static analysis
    4. SRM - Security Risk Management

You: 1

AI: What would you like to scan?
    1. Current directory
    2. Remote GitHub repository

You: 1

AI: I'll scan the current directory. Let me collect your Polaris credentials...
    Server URL:

You: https://poc.polaris.blackduck.com

AI: Access Token:

You: <your-token>

[... continues with interactive flow ...]
```

## Installation

This skill is installed automatically when you install the bridge-cli-skill package.

See the main [README.md](../../README.md) for installation instructions.

## Requirements

- Bridge CLI binary installed on your system
- Valid credentials for your target security platform (Polaris/BlackDuck/Coverity/SRM)

## Security

This skill follows security best practices:
- Never logs or displays full access tokens
- Masks credentials in JSON display
- Validates HTTPS URLs
- Warns before destructive operations
