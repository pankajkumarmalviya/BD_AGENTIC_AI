# Bridge CLI Skill for AI Coding Assistants

## What Is This?

A simple add-on that lets your AI coding assistant (like Claude Code, Cursor, or Copilot) run security scans on your code with just a conversation - no manual commands needed.

Think of it as: **"Tell your AI to scan for security issues, and it does everything automatically."**

---

## What Does It Do?

Instead of remembering complex security scan commands, you just type:
```
/blackduck-init
```

Your AI assistant then:
1. Asks you simple questions (which scan type? which project?)
2. Builds the technical configuration automatically
3. Runs the security scan
4. Shows you the results in plain English

**Supported Security Scans:**
- **Polaris** - Finds bugs in your code + checks open source libraries
- **Black Duck SCA** - Checks if your open source libraries have vulnerabilities
- **Coverity** - Deep code analysis for compiled languages (Java, C++, etc.)
- **SRM** - Security risk management and compliance

---

## How to Install

### One-Line Install

**Mac / Linux / WSL:**
```bash
curl -fsSL "https://raw.githubusercontent.com/pankajkumarmalviya/BD_AGENTIC_AI/master/install.sh?v=2" | bash
```

**Windows PowerShell:**
```powershell
iwr "https://raw.githubusercontent.com/pankajkumarmalviya/BD_AGENTIC_AI/master/install.ps1?v=2" | iex
```

### What Happens When You Install?

The installer does 2 main things:

#### 1. Downloads and Installs Bridge CLI

**What is Bridge CLI?**
Bridge CLI is Black Duck's command-line tool that actually runs the security scans (Polaris, Black Duck SCA, Coverity, SRM).

**What the installer does:**
- Detects your operating system (Mac, Windows, Linux)
- Downloads the correct Bridge CLI version for your system (about 100MB)
- Extracts it to: `~/bridge-cli/bridge-cli-bundle-X.X.X-<platform>/`
- Example: `/Users/yourname/bridge-cli/bridge-cli-bundle-4.5.0rc3-macos_arm/`
- Makes the `bridge-cli` binary executable
- **Note:** It does NOT add Bridge CLI to your system PATH automatically

**Why you need it:**
Without Bridge CLI, you can't run security scans. This skill just makes it easier to use - it doesn't replace Bridge CLI.

#### 2. Installs the Skill for Your AI Assistants

**What is the skill?**
The skill is a set of instructions that teaches your AI assistant how to:
- Ask you the right questions
- Build the correct scan configuration
- Run Bridge CLI with the right commands
- Parse and show results in a readable format

**What the installer does:**
- Detects which AI assistants you have installed (Claude Code, Cursor, Windsurf, etc.)
- Copies skill files to each assistant's skills directory:
  - **Claude Code:** `~/.claude/skills/blackduck-init/`
  - **Cursor:** `~/.cursor-tutor/skills/blackduck-init/`
  - **Windsurf:** `~/.codeium/windsurf/skills/blackduck-init/`
  - **Cline:** `~/.continue/skills/blackduck-init/`

**What's in the skill folder?**
- `SKILL.md` - Instructions for the AI on how to run scans
- `cli/generate-input.js` - Script to build scan configurations
- `cli/clone-repo.js` - Script to clone GitHub repos for scanning
- Documentation files

#### 3. Summary of File Locations

After installation, here's where everything lives:

| What | Where | Size |
|------|-------|------|
| Bridge CLI binary | `~/bridge-cli/bridge-cli-bundle-X.X.X-<platform>/bridge-cli` | ~100MB |
| Skill files (Claude Code) | `~/.claude/skills/blackduck-init/` | ~200KB |
| Skill files (Cursor) | `~/.cursor-tutor/skills/blackduck-init/` | ~200KB |
| Skill files (Windsurf) | `~/.codeium/windsurf/skills/blackduck-init/` | ~200KB |

**Important:**
- The installer does NOT modify your shell configuration (.bashrc, .zshrc)
- The installer does NOT require admin/sudo permissions
- The installer does NOT install Node.js (you need Node.js 18+ already installed)

---

## How to Use It

1. **Open your AI coding assistant** (Claude Code, Cursor, etc.)
2. **Type:** `/blackduck-init`
3. **Answer the questions:**
   - Which scan? (Polaris, Black Duck, etc.)
   - Which project folder?
   - Your login credentials (server URL, tokens)
4. **Wait for results** (usually 2-10 minutes)
5. **See the summary** - AI shows you how many issues were found

### Example Conversation

```
You: /blackduck-init

AI: Which security scan would you like to run?
    1. Polaris
    2. Black Duck SCA
    3. Coverity
    4. SRM

You: Polaris

AI: What's your Polaris server URL?
You: https://polaris.blackduck.com

AI: Access token?
You: [paste your token]

AI: Which folder to scan?
You: /Users/me/my-project

AI: Running scan... ⏳
    ✅ Scan complete!

    Found 23 issues:
    🔴 Critical: 2
    🟠 High: 5
    🟡 Medium: 10
    🔵 Low: 6
```

---

## How to Uninstall

### Quick Uninstall

**Mac / Linux / WSL:**
```bash
curl -fsSL "https://raw.githubusercontent.com/pankajkumarmalviya/BD_AGENTIC_AI/master/install.sh?v=2" | bash -s -- --uninstall
```

**Windows PowerShell:**
```powershell
iwr "https://raw.githubusercontent.com/pankajkumarmalviya/BD_AGENTIC_AI/master/install.ps1?v=2" | iex -ArgumentList "--uninstall"
```

### What Happens When You Uninstall?

1. **Removes the skill** from your AI assistants
2. **Keeps Bridge CLI** installed (in case you want to use it manually)
3. Your scan history and results are **NOT deleted**

**To also remove Bridge CLI:**
```bash
rm -rf ~/bridge-cli
```

---

## Common Questions

**Q: Do I need to know security tools to use this?**
A: No! Just answer the questions - the AI handles the technical parts.

**Q: Is my code sent anywhere?**
A: Only to the security scanning service you choose (Polaris, Black Duck, etc.) - same as if you ran scans manually.

**Q: Which AI assistants work with this?**
A: Claude Code, Cursor, Windsurf, Cline, GitHub Copilot (with MCP support)

**Q: Do I need Bridge CLI installed first?**
A: No! The installer downloads it automatically.

**Q: What if I don't have credentials for Polaris/Black Duck?**
A: Contact your security team - they'll give you the server URL and access tokens.
