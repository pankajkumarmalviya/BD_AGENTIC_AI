# Bridge CLI Security Scanner Skill

One command. Security scans everywhere. Bridge CLI integration for 30+ AI coding assistants.

## What You Get

Bridge CLI scanner drops into Claude Code, Cursor, Windsurf, Cline, Copilot, Gemini CLI, and 25+ more AI assistants. Type `/bridge-scan` → get interactive security scanning with Polaris, Black Duck SCA, Coverity, or SRM. No JSON config memorization. No manual Bridge CLI setup. Just answer questions, get results.

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
/bridge-scan

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
| 25+ others | ✅ Full | Via `/bridge-scan` command |

See [INSTALL.md](INSTALL.md) for per-agent details.

## What It Does

Bridge scanner skill = interactive Bridge CLI wrapper. Asks questions. Builds JSON. Runs scans. Shows results.

### Supported Scan Types

1. **Polaris** - SAST (static analysis) + SCA (open source)
2. **Black Duck SCA** - Open source vulnerability analysis
3. **Coverity** - Static code analysis (compiled languages)
4. **SRM** - Security Risk Management
5. **Signal** - AI-powered security analysis (works on ANY language, finds novel bugs)

### Features

- Interactive question flow (no JSON memorization)
- Auto-generates input.json from your answers
- Scans local directories or remote GitHub repos
- Masks credentials automatically
- Formatted results with severity breakdown
- SARIF report generation
- Error handling with troubleshooting tips

## Usage

After install, type `/bridge-scan` in any supported AI assistant:

```
You: /bridge-scan

AI guides you through:
1. Select scan type (Polaris/BlackDuck/Coverity/SRM)
2. Choose target (local directory or GitHub URL)
3. Provide credentials
4. Configure options
5. Review generated JSON
6. Run scan
7. View formatted results
```

## Requirements

- **Node.js ≥18** - Required for installer ([Download](https://nodejs.org/))
- **Bridge CLI** - ✅ Auto-installed by this installer!
- **Security Platform Credentials** - Polaris, Black Duck, Coverity, or SRM access token/credentials

That's it. Installer handles Bridge CLI download and installation automatically.

## Examples

### Polaris SCA Scan

```
/bridge-scan
→ Polaris
→ Current directory
→ Server: https://poc.polaris.blackduck.com
→ Token: ***
→ Assessment: SCA
→ ✅ Scan complete: 10 Critical, 152 High
```

### Black Duck Scan on Remote Repo

```
/bridge-scan
→ Black Duck SCA
→ Remote repository
→ Repo: https://github.com/user/project
→ Server: https://blackduck.example.com
→ Token: ***
→ ✅ Scan complete: 25 vulnerabilities found
```

### Coverity on Compiled Project

```
/bridge-scan
→ Coverity
→ Current directory
→ URL: https://coverity.example.com
→ Username/Password: ***
→ Build command: mvn clean package
→ ✅ Scan complete: 8 defects found
```

### Signal AI Scan

```
/bridge-scan
→ Signal
→ Current directory
→ Gateway: https://llm.labs.blackduck.com
→ Gateway Key: ***
→ Upload to Polaris? Yes
→ Polaris URL/Token: ***
→ ✅ AI scan complete: 12 high-priority issues found
→ 🔗 View in Polaris
→ 📄 SARIF: signal-results.sarif
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
- [Skill README](skills/bridge-scan/README.md) - How the skill works
- [INPUT_JSON_FORMAT.md](https://github.com/pankajkumarmalviya/BD_AGENTIC_AI/blob/master/docs/INPUT_JSON_FORMAT.md) - Bridge CLI JSON reference

## Contributing

Pull requests welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License. See [LICENSE](LICENSE).

## Credits

Built for Bridge CLI by Black Duck.
