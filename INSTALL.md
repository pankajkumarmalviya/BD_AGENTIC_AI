# Installation Guide

Complete installation instructions for Bridge CLI Skill across all supported AI assistants.

## Quick Install

### macOS / Linux / WSL / Git Bash

```bash
curl -fsSL "https://raw.githubusercontent.com/pankajkumarmalviya/BD_AGENTIC_AI/master/install.sh?v=2" | bash
```

### Windows PowerShell

```powershell
iwr "https://raw.githubusercontent.com/pankajkumarmalviya/BD_AGENTIC_AI/master/install.ps1?v=2" | iex
```

The installer automatically detects your installed AI assistants and configures the skill for each one.

## Requirements

- **Node.js 18 or higher** - [Download here](https://nodejs.org/)
- **Bridge CLI binary** - ✅ Automatically installed by this installer!
- Valid credentials for your target security platform (Polaris, Black Duck, Coverity, or SRM)

The installer automatically:
1. Detects your operating system (macOS/Linux/Windows) and architecture
2. Downloads the correct Bridge CLI binary
3. Extracts and installs it to your system
4. Configures the skill for all detected AI assistants

## Supported AI Assistants

| AI Assistant | Auto-detected | Installation Method |
|--------------|---------------|---------------------|
| Claude Code | ✅ | Direct skill installation |
| Cursor | ✅ | via npx skills |
| Windsurf | ✅ | via npx skills |
| Cline | ✅ | via npx skills |
| GitHub Copilot | ✅ (soft) | via npx skills |
| Codex | ✅ | Direct skill installation |
| Gemini CLI | Manual | See below |
| Others | Manual | See below |

## Manual Installation

If the automatic installer doesn't work for your AI assistant, you can manually install the skill:

### For Claude Code

1. Clone this repository or download the skill files
2. Copy the `skills/bridge-scan` directory to `~/.claude/skills/bridge-scan`
3. Restart Claude Code

### For Cursor

1. Run: `npx skills add path/to/bridge-cli-skill/skills/bridge-scan/SKILL.md -a cursor`
2. Restart Cursor

### For Windsurf

1. Run: `npx skills add path/to/bridge-cli-skill/skills/bridge-scan/SKILL.md -a windsurf`
2. Restart Windsurf

### For Cline

1. Run: `npx skills add path/to/bridge-cli-skill/skills/bridge-scan/SKILL.md -a cline`
2. Restart your IDE

### For GitHub Copilot

1. Run: `npx skills add path/to/bridge-cli-skill/skills/bridge-scan/SKILL.md -a github-copilot`
2. Restart VS Code

### For Codex

1. Copy the `skills/bridge-scan` directory to `~/.codex/skills/bridge-scan`
2. Restart Codex

### For Gemini CLI

1. Copy `skills/bridge-scan/SKILL.md` to your Gemini CLI context directory
2. Configure Gemini to load the skill file

### For Other AI Assistants

Most AI assistants support loading skills via markdown files. Consult your AI assistant's documentation for how to add custom skills, then reference the `skills/bridge-scan/SKILL.md` file.

## Verification

After installation, verify the skill is available:

1. Open your AI assistant
2. Type `/bridge-scan`
3. The assistant should start the interactive Bridge CLI setup flow

If it doesn't work:
- Restart your AI assistant
- Check that the skill files are in the correct location
- Run the installer again with `--list` flag to see detected assistants:
  ```bash
  curl -fsSL "https://raw.githubusercontent.com/pankajkumarmalviya/BD_AGENTIC_AI/master/install.sh?v=2" | bash -s -- --list
  ```

## Uninstall

### Automatic Uninstall

**macOS / Linux / WSL / Git Bash:**
```bash
curl -fsSL "https://raw.githubusercontent.com/pankajkumarmalviya/BD_AGENTIC_AI/master/install.sh?v=2" | bash -s -- --uninstall
```

**Windows PowerShell:**
```powershell
iwr "https://raw.githubusercontent.com/pankajkumarmalviya/BD_AGENTIC_AI/master/install.ps1?v=2" | iex -ArgumentList "--uninstall"
```

### Manual Uninstall

Remove the skill directory from your AI assistant's configuration:

- **Claude Code**: `rm -rf ~/.claude/skills/bridge-scan`
- **Codex**: `rm -rf ~/.codex/skills/bridge-scan`
- **Others**: Use `npx skills remove` or manually delete the skill file

## Troubleshooting

### "No AI assistants detected"

The installer couldn't find any supported AI assistants. Make sure you have at least one installed, then run the installer again.

### "Node.js not found"

Install Node.js 18 or higher from [nodejs.org](https://nodejs.org/)

### "Permission denied"

On macOS/Linux, you may need to make the installer executable:
```bash
chmod +x install.sh
./install.sh
```

### Skill not showing up

1. Restart your AI assistant completely
2. Check the skill was copied to the correct directory
3. For Claude Code, check `~/.claude/skills/bridge-scan/SKILL.md` exists
4. For other assistants, verify via their skill management interface

### "Bridge CLI not found" when running scan

The skill requires Bridge CLI to be installed on your system:
1. Download from Bridge CLI official documentation
2. Make sure it's in your PATH or note the full path
3. When the skill asks for Bridge CLI location, provide the full path

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/pankajkumarmalviya/BD_AGENTIC_AI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pankajkumarmalviya/BD_AGENTIC_AI/discussions)
- **Bridge CLI Docs**: Official Bridge CLI Documentation

## Next Steps

After installation:
1. Type `/bridge-scan` in your AI assistant
2. Follow the interactive prompts
3. Have your security platform credentials ready
4. Enjoy automated security scanning!
