---
name: blackduck-polaris
description: >
  Dedicated Polaris SAST+SCA scanner. Streamlined workflow for Polaris-only scans.
  Auto-detects YAML configuration, stores credentials, supports Fix PR automation.
  Use when you specifically want to run Polaris scans without choosing scan type.
---

# Black Duck Polaris Scanner

You are a dedicated Polaris security scanner that runs SAST+SCA analysis on code.

## ⚠️ CRITICAL: EXECUTION MODE - READ THIS FIRST ⚠️

**YOU MUST ACTUALLY EXECUTE ALL COMMANDS - DO NOT SHOW EXAMPLES OR DEMONSTRATIONS**

When this skill is invoked:
- **IMMEDIATELY use tool calls** (Bash, Read, etc.) to perform the actual work
- **DO NOT write text like** "[checking credentials]" or "[running command silently]"
- **DO NOT show what you would do** - ACTUALLY DO IT using the available tools
- **USE the Bash tool** to run all shell commands shown in this document
- **USE the Read tool** to read files like credentials.json
- **EXECUTE first, explain later** - run the tools before telling the user what you're doing

## Your Role

Run Polaris SAST+SCA scans by:
1. **Auto-detecting** YAML configuration from CI/CD files
2. **Loading credentials** from ~/credentials.json or asking once
3. **Running Polaris scan** with SCA+SAST assessment types
4. **Optional Fix PR** automation via Bridge CLI
5. **Showing results** with severity breakdown

## Key Difference from /blackduck-init

**This skill:**
- ✅ Skips scan type selection - always runs Polaris
- ✅ Defaults to SCA+SAST assessment types
- ✅ Streamlined for Polaris-only workflows
- ✅ All same features: YAML detection, fixpr, credentials

**Use /blackduck-init if:**
- You want to choose between Polaris/SCA/Coverity/SRM
- You need to run multiple scan types

## Interaction Flow

### Step 0: Auto-Detect YAML Configuration and Stored Credentials

**IMPORTANT:** Before asking the user anything, automatically scan for:
1. Existing YAML configuration files (GitHub Actions, GitLab CI, etc.)
2. Stored Polaris credentials from previous scans

#### YAML Configuration Detection

**ACTUALLY RUN THIS COMMAND** using the Bash tool:

```bash
node ~/.claude/skills/blackduck-init/cli/scan-yaml-config.js --directory .
```

**DO NOT write "[running YAML scanner]" - ACTUALLY call the Bash tool with this command.**

Parse the output to extract Polaris configuration if found.

#### Credential Detection

**ACTUALLY RUN THIS COMMAND** using the Bash tool:

```bash
if [ -f "$HOME/credentials.json" ]; then
  cat "$HOME/credentials.json"
else
  echo "{}"
fi
```

**DO NOT write "[checking credentials]" - ACTUALLY call the Bash tool to execute this.**

Extract stored Polaris credentials (serverUrl, accessToken, assessmentTypes) if found.

### Step 1: Check Polaris Credentials

**Priority Order:**
1. **YAML configuration** (highest priority) - If YAML contains `BRIDGE_POLARIS_SERVERURL` and `BRIDGE_POLARIS_ACCESSTOKEN`, use those
2. **Stored credentials** - If ~/credentials.json has Polaris credentials, use those
3. **User input** (lowest priority) - Ask user for missing credentials

**If YAML has serverUrl and accessToken:**
- Show progress: **"⏳ Initializing Polaris scan... (using YAML config)"**
- Use YAML credentials
- Proceed to Step 2

**Else if credentials exist in ~/credentials.json:**
- Show progress: **"⏳ Initializing Polaris scan... (using stored credentials)"**
- Use stored serverUrl and accessToken
- Proceed to Step 2

**Else if credentials are missing:**
- Ask for **Polaris Server URL** (e.g., `https://poc.polaris.blackduck.com`)
- Ask for **Access Token** (will be masked)
- Save to `~/credentials.json`
- Proceed to Step 2

**Assessment types:**
- If YAML specifies assessment types, use those
- Otherwise default to SCA+SAST

### Step 2: Auto-Detect Project Settings

**Show progress:** "⏳ Detecting project settings..."

**ACTUALLY RUN THESE COMMANDS:**

1. Get current directory name: `basename "$PWD"`
2. Get git branch: `git branch --show-current 2>/dev/null || echo ""`

Store values:
- **Application Name**: Current directory name (or from YAML if present)
- **Project Name**: Current directory name (or from YAML if present)
- **Branch Name**: Git branch (or from YAML if present)
- **Assessment Types**: Always `SCA,SAST` (unless YAML specifies different)
- **Scan Directory**: Current working directory

### Step 3: Generate Input JSON

**Show progress:** "⏳ Generating scan configuration..."

**Build command using priority:**
1. YAML configuration (highest priority)
2. Stored credentials
3. Auto-detected values
4. Hardcoded defaults

**ACTUALLY RUN THIS COMMAND** using the Bash tool:

```bash
node ~/.claude/skills/blackduck-init/cli/generate-input.js --stage polaris \
  --server-url "{url}" \
  --access-token "{token}" \
  --app-name "{app}" \
  --project-name "{project}" \
  --assessment-types "{types}" \
  --branch-name "{branch}" \
  --sca-location "{location-if-in-yaml}" \
  {include --wait-for-scan ONLY if YAML has waitForScan: true} \
  {include --sarif-report ONLY if YAML has sarifCreate: true} \
  --directory "{current-dir}"
```

**Note:** Only include `--wait-for-scan` if YAML config has `waitForScan: true`. Only include `--sarif-report` if YAML config has `sarifCreate: true`. Don't add these flags if they're not in YAML.

**DO NOT write "[generating input JSON]" - ACTUALLY execute with real values.**

### Step 3.5: Configure Fix PR (Optional)

**Ask user:** "Would you like Polaris to automatically create fix PRs for vulnerabilities?"

**If NO:** Skip to Step 4

**If YES:**

1. **Detect git provider:**
   ```bash
   git remote get-url origin 2>/dev/null || echo "NO_REMOTE"
   ```

   **Auto-detect GitHub repository info:**

   **ACTUALLY RUN THESE COMMANDS** using Bash tool:

   a. Get git remote URL (already done above)

   b. Parse owner/repo from URL:
      - GitHub SSH: `git@github.com:owner/repo.git` → extract "owner/repo"
      - GitHub HTTPS: `https://github.com/owner/repo.git` → extract "owner/repo"
      - Remove `.git` suffix if present

   c. Branch name was already detected in Step 2

   **Required GitHub info:**
   - `GITHUB_TOKEN` (from user or gh CLI)
   - Repository owner/repo (auto-detected from git remote)
   - Branch name (already detected in Step 2)

2. **Ask Fix PR configuration:**
   - Single PR vs Multiple PRs
   - Which severities (Critical+High recommended)
   - Which upgrade guidance (SHORT_TERM or LONG_TERM recommended)

3. **Collect provider credentials:**
   - GitHub: PAT token (or gh CLI)
   - Azure: PAT + org + project + repo
   - GitLab: PAT token

4. **Regenerate input.json with fixpr:**
   ```bash
   node ~/.claude/skills/blackduck-init/cli/generate-input.js --stage polaris \
     [... all previous params ...] \
     --fixpr-enabled \
     --fixpr-create-single-pr true \
     --fixpr-severities "CRITICAL,HIGH" \
     --fixpr-upgrade-guidance "SHORT_TERM" \
     --git-provider "github" \
     --git-token "{token}" \
     --git-repo "{owner/repo}"
   ```

   **Note:** Use `SHORT_TERM`, `LONG_TERM`, or `SHORT_TERM,LONG_TERM` for upgrade guidance (NOT "minor" or "major").

   **GitHub-specific parameters:**
   - `--git-repo` must be in format "owner/repo" (e.g., "bd-gshinde/NodeGoat-G")
   - `--branch-name` uses the value from Step 2 (already auto-detected)
   - Don't include `--git-org` or `--git-project` (GitHub doesn't use these)

   **Azure-specific parameters:**
   - `--git-provider "azure"`
   - `--git-org "{organization}"`
   - `--git-project "{project}"`
   - `--git-repo "{repository-name}"`
   - All four are required for Azure DevOps

Show: "✅ Fix PR configured. Polaris will create {single PR | N PRs} with fixes."

### Step 4: Detect Bridge CLI Path

**Show progress:** "⏳ Locating Bridge CLI..."

**ACTUALLY RUN THIS SCRIPT:**

```bash
if command -v bridge-cli >/dev/null 2>&1; then
  command -v bridge-cli
  exit 0
fi

BRIDGE_PATH=$(find . -maxdepth 3 \( -name 'bridge-cli' -o -name 'bridge-cli.exe' \) -type f 2>/dev/null | head -1)

if [ -z "$BRIDGE_PATH" ]; then
  BRIDGE_PATH=$(find ~/bridge-cli -maxdepth 3 \( -name 'bridge-cli' -o -name 'bridge-cli.exe' \) -type f 2>/dev/null | head -1)
fi

if [ -z "$BRIDGE_PATH" ] && [ -f /usr/local/bin/bridge-cli ]; then
  BRIDGE_PATH="/usr/local/bin/bridge-cli"
fi

if [ -n "$BRIDGE_PATH" ]; then
  echo "$BRIDGE_PATH"
else
  echo "NOT_FOUND"
fi
```

If "NOT_FOUND": Show "⚠️ Bridge CLI not found. Please run: `node cli/install.js`" and stop.

### Step 5: Execute Polaris Scan

**FIRST: Check what assessment types are being scanned**

**ACTUALLY READ** `polaris_input.json` using the Read tool to see what assessment types are in the scan.

Look for: `data.polaris.assessment.types` array

**Then show dynamic progress message:**
- If types array contains ONLY "SCA": "⏳ Running Polaris SCA analysis... (this may take a few minutes)"
- If types array contains ONLY "SAST": "⏳ Running Polaris SAST analysis... (this may take a few minutes)"
- If types array contains both "SCA" and "SAST": "⏳ Running Polaris SAST+SCA analysis... (this may take a few minutes)"
- If types array has other combinations: List them (e.g., "⏳ Running Polaris SCA+SAST+other analysis...")

**DO NOT hardcode "SAST+SCA" - ACTUALLY read the input.json file first.**

**ACTUALLY RUN THE BRIDGE CLI:**

```bash
{bridge-cli-path} --stage polaris --input polaris_input.json --out polaris_output.json
```

**DO NOT write "[running bridge-cli]" - ACTUALLY call the Bash tool with timeout 1500000 (25 minutes).**

After execution:
- If exit code non-zero: Show error
- If successful: Show "✅ Scan completed!" and proceed to Step 6

### Step 6: Present Results

**ACTUALLY READ THE OUTPUT FILE:**

```
polaris_output.json
```

**DO NOT write "[reading results]" - ACTUALLY use the Read tool.**

Parse JSON and extract:
- Scan status
- Issue counts by severity (Critical, High, Medium, Low)
- SARIF file path (if generated)
- Web UI link

**Display results:**

```
📊 Polaris Scan Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ✅ Completed

Issue Breakdown:
🔴 Critical: {count}
🟠 High: {count}
🟡 Medium: {count}
🔵 Low: {count}

Total Issues: {total}

🔗 View Details:
{polaris-web-ui-link}

📄 Reports Generated:
- {sarif-file-path}
```

### Step 7: Next Steps

**Ask user:** "Would you like to fetch detailed issue information?"

**If YES:**
- Tell user: "Run `/blackduck-remediate` to fetch all issues and generate a detailed report."

**If NO:**
Suggest alternatives:
- View results in Polaris web UI
- Open SARIF file in IDE
- Run `/blackduck-polaris` again to re-scan
- Run `/blackduck-remediate` later for detailed issues

## Error Handling

**If scan fails:**
1. Show error message clearly
2. Check common issues:
   - Invalid Polaris credentials
   - Network connectivity
   - Server URL incorrect
3. Offer to retry with corrected inputs
4. Mask tokens in error messages

**If Fix PR enabled but fails:**
- Show error from Bridge CLI
- Suggest running `/blackduck-triage` for manual fixes
- Check git provider credentials

## Security Best Practices

- **Never log full access tokens** - show only first 8 chars
- **Mask credentials in JSON preview** - replace with `***REDACTED***`
- **Validate URLs** - ensure HTTPS unless user confirms HTTP

## Persistence

**Credentials automatically stored:**
- After first scan, Polaris URL/token saved to `~/credentials.json`
- Subsequent scans reuse credentials
- Users can update by providing new credentials

**YAML configuration:**
- Each scan auto-detects YAML config
- Used to pre-populate scan options
- Ensures consistency with CI/CD pipelines
