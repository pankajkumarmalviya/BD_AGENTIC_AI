# Bridge CLI Security Scanner Skill

One command. Security scans everywhere. Bridge CLI integration for 30+ AI coding assistants.

## What You Get

Bridge CLI scanner drops into Claude Code, Cursor, Windsurf, Cline, Copilot, Gemini CLI, and 25+ more AI assistants with **5 specialized skills**. Type `/blackduck-init` for multi-scanner workflows, or use dedicated skills (`/blackduck-polaris`, `/blackduck-sca`) for streamlined single-scanner projects. Complete remediation workflow included (`/blackduck-remediate`, `/blackduck-triage`). No JSON config memorization. No manual Bridge CLI setup. Just answer questions, get results.

### Before

```bash
# Remember JSON structure
# Create input.json manually
# Look up Bridge CLI flags
# Parse output JSON yourself
# Repeat for every scan type
```

### After

```
/blackduck-init

Which security scan? → Polaris
Scan what? → Current directory
Server URL? → https://polaris.example.com
Access Token? → ***
[Generates JSON, runs scan, shows formatted results]

📊 Scan Results: 10 Critical, 152 High, 217 Medium, 29 Low
🔗 View: https://polaris.example.com/...
```

Token saved. Brain still big.

## Install

### macOS · Linux · WSL · Git Bash

```bash
curl -fsSL "https://raw.githubusercontent.com/pankajkumarmalviya/BD_AGENTIC_AI/master/install.sh?v=2" | bash
```

### Windows PowerShell

```powershell
iwr "https://raw.githubusercontent.com/pankajkumarmalviya/BD_AGENTIC_AI/master/install.ps1?v=2" | iex
```

One command installs **BOTH**:
1. ✅ Bridge CLI binary (auto-downloaded)
2. ✅ Skill for all your AI assistants

No manual downloads. No PATH setup (well, maybe). Just run and scan.

## Supported AI Assistants

| AI Assistant | Support | Auto-activates |
|--------------|---------|----------------|
| Claude Code | ✅ Full | Yes |
| Cursor | ✅ Full | Yes |
| Windsurf | ✅ Full | Yes |
| Cline | ✅ Full | Yes |
| Copilot | ✅ Full | Yes |
| Gemini CLI | ✅ Full | Yes |
| Codex | ✅ Full | Yes |
| 25+ others | ✅ Full | Via `/blackduck-init` command |

See [INSTALL.md](INSTALL.md) for per-agent details.

## What It Does

Five skills for complete security workflow:

**1. `/blackduck-init`** - Interactive Bridge CLI wrapper
- Asks questions, builds JSON, runs scans, shows results
- Supports Polaris, Black Duck SCA, Coverity, and SRM
- Auto-detects configuration from existing YAML files (GitHub Actions, GitLab CI, Azure DevOps, etc.)
- Stores credentials for future scans
- Optional Fix PR automation via Bridge CLI

**2. `/blackduck-polaris`** - Dedicated Polaris scanner
- Streamlined workflow - always runs Polaris SAST+SCA
- Skips scan type selection for faster execution
- All same features as /blackduck-init (YAML detection, fixpr, credentials)
- Perfect for Polaris-only projects

**3. `/blackduck-sca`** - Dedicated SCA scanner
- Streamlined workflow - always runs Black Duck SCA
- SCA-specific options (full vs incremental scan)
- License analysis and policy violation detection
- Perfect for SCA-only projects

**4. `/blackduck-remediate`** - Issue reporter
- Fetches detailed security issues from Polaris via API
- Generates markdown report (`POLARIS_ISSUES.md`) with remediation steps
- Extracts issue names, severities, file locations, CVEs, and fixes

**5. `/blackduck-triage`** - Automated fixer
- Applies fixes to code based on remediation guidance
- Creates new branch with random ID (`blackduck-fixes-{id}`)
- Fixes issues iteratively (user confirms each)
- Commits, pushes, and creates PR automatically
- Offers to re-scan to verify fixes

### Complete Workflow

```
# Multi-scanner workflow
/blackduck-init → /blackduck-remediate → /blackduck-triage → /blackduck-init
     (scan)            (fetch issues)        (apply fixes)      (verify)

# Streamlined Polaris workflow
/blackduck-polaris → /blackduck-remediate → /blackduck-triage → /blackduck-polaris
   (SAST+SCA)            (fetch issues)        (apply fixes)      (verify)

# Streamlined SCA workflow
/blackduck-sca → view results in web UI → manual remediation → /blackduck-sca
  (SCA scan)                                                      (verify)
```

**Choose your workflow:**
- **Multi-scanner projects**: Use `/blackduck-init` to choose between Polaris, SCA, Coverity, SRM
- **Polaris-only projects**: Use `/blackduck-polaris` for faster workflow
- **SCA-only projects**: Use `/blackduck-sca` for faster workflow

### Supported Scan Types

1. **Polaris** - SAST (static analysis) + SCA (open source)
2. **Black Duck SCA** - Open source vulnerability analysis
3. **Coverity** - Static code analysis (compiled languages)
4. **SRM** - Security Risk Management
5. **Signal** - AI-powered security analysis via MCP (works on ANY language, finds novel bugs)

### Features

- Interactive question flow (no JSON memorization)
- Auto-generates input.json from your answers
- Scans local directories or remote GitHub repos
- Masks credentials automatically
- Formatted results with severity breakdown
- SARIF report generation
- Error handling with troubleshooting tips

## Usage

After install, choose your skill based on your workflow:

### Multi-Scanner Projects
```
You: /blackduck-init

AI guides you through:
1. Select scan type (Polaris/BlackDuck/Coverity/SRM)
2. Choose target (local directory or GitHub URL)
3. Provide credentials
4. Configure options (including optional Fix PR automation)
5. Review generated JSON
6. Run scan
7. View formatted results
```

### Polaris-Only Projects
```
You: /blackduck-polaris

AI runs Polaris SAST+SCA:
- Auto-detects YAML config and credentials
- Skips scan type selection
- Runs Polaris scan immediately
- Optionally creates fix PRs
- Shows formatted results
```

### SCA-Only Projects
```
You: /blackduck-sca

AI runs Black Duck SCA:
- Auto-detects YAML config and credentials
- Choose: Incremental or Full scan
- Runs SCA analysis with license detection
- Optionally creates fix PRs
- Shows vulnerability breakdown and policy violations
```

### Remediation Workflow
```
You: /blackduck-remediate

AI fetches detailed issues:
- Connects to Polaris API
- Fetches all security issues
- Generates POLARIS_ISSUES.md report
- Includes CVEs, CWEs, remediation steps

You: /blackduck-triage

AI applies automated fixes:
- Creates new branch (blackduck-fixes-{id})
- Fixes issues one by one
- Commits and pushes changes
- Creates pull request
- Offers to re-scan
```

## Requirements

- **Node.js ≥18** - Required for installer ([Download](https://nodejs.org/))
- **Bridge CLI** - ✅ Auto-installed by this installer!
- **Security Platform Credentials** - Polaris, Black Duck, Coverity, or SRM access token/credentials
- **For Signal scans:** Black Duck MCP server + `BRIDGE_SIGNAL_LLM_KEY` environment variable

That's it. Installer handles Bridge CLI download and installation automatically. For Signal, see MCP setup instructions.

## Examples

### Complete Security Fix Workflow

```
# Step 1: Run scan
/blackduck-init
→ Polaris
→ Server: https://poc.polaris.blackduck.com
→ Token: ***
→ ✅ Scan complete: 10 Critical, 152 High

# Step 2: Fetch detailed issues
/blackduck-remediate
→ ⏳ Fetching issues from Polaris...
→ ✅ Found 12 security issues
→ 📄 Full report saved to: POLARIS_ISSUES.md

# Step 3: Apply automated fixes
/blackduck-triage
→ Fix critical only (3 issues)
→ ✅ Created branch: blackduck-fixes-247
→ 🔧 Fixing node-tar vulnerability...
→ ✅ Applied fix: Upgraded tar 4.4.8 → 7.5.10
→ ✅ Committed and pushed
→ ✅ PR created: https://github.com/user/repo/pull/42

# Step 4: Re-scan to verify
/blackduck-init
→ ✅ Scan complete: 0 Critical, 149 High
→ 🎉 All critical issues fixed!
```

### Polaris SCA Scan

```
/blackduck-init
→ Polaris
→ Current directory
→ Server: https://poc.polaris.blackduck.com
→ Token: ***
→ Assessment: SCA
→ ✅ Scan complete: 10 Critical, 152 High
```

### Black Duck Scan on Remote Repo

```
/blackduck-init
→ Black Duck SCA
→ Remote repository
→ Repo: https://github.com/user/project
→ Server: https://blackduck.example.com
→ Token: ***
→ ✅ Scan complete: 25 vulnerabilities found
```

### Coverity on Compiled Project

```
/blackduck-init
→ Coverity
→ Current directory
→ URL: https://coverity.example.com
→ Username/Password: ***
→ Build command: mvn clean package
→ ✅ Scan complete: 8 defects found
```

### Signal AI Scan (via MCP)

```
# Prerequisites: Black Duck MCP server installed + BRIDGE_SIGNAL_LLM_KEY set

/blackduck-init
→ Signal
→ What to scan? Specific files
→ File path: src/SecurityScanner.java
→ ✅ Scan complete: 1 security warning found

📊 Black Duck Signal AI Scan Results
🔶 Relative Path Traversal (CVSS 6.5 - Medium)
Location: src/SecurityScanner.java:148
Risk: Path traversal sequences could access files outside workspace
Recommended fix displayed with code example

Would you like me to apply this fix? [Y/N]
```

## Uninstall

### From Local Clone
```bash
node cli/uninstall.js
# or
npm run uninstall
```

### From Remote

**macOS / Linux / WSL / Git Bash:**
```bash
curl -fsSL "https://raw.githubusercontent.com/pankajkumarmalviya/BD_AGENTIC_AI/master/install.sh?v=2" | bash -s -- --uninstall
```

**Windows PowerShell:**
```powershell
iwr "https://raw.githubusercontent.com/pankajkumarmalviya/BD_AGENTIC_AI/master/install.ps1?v=2" | iex -ArgumentList "--uninstall"
```

## Privacy

Bridge scanner no phone home. No telemetry. No accounts. No backend. All local. Your credentials stay your credentials.

## Documentation

- [Installation Guide](INSTALL.md) - Per-agent install instructions
- [Multi-Scanner Skill](skills/blackduck-init/README.md) - `/blackduck-init` documentation
- [Polaris Skill](skills/blackduck-polaris/README.md) - `/blackduck-polaris` documentation
- [SCA Skill](skills/blackduck-sca/README.md) - `/blackduck-sca` documentation
- [Remediate Skill](skills/blackduck-remediate/README.md) - `/blackduck-remediate` documentation
- [Triage Skill](skills/blackduck-triage/README.md) - `/blackduck-triage` documentation
- [INPUT_JSON_FORMAT.md](https://github.com/pankajkumarmalviya/BD_AGENTIC_AI/blob/master/docs/INPUT_JSON_FORMAT.md) - Bridge CLI JSON reference

## Contributing

Pull requests welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License. See [LICENSE](LICENSE).

## Credits

Built for Bridge CLI by Black Duck.
