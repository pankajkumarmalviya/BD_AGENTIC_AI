---
name: blackduck-reverify
description: >
  Reverifies fix PRs by running scans on PR branches created by Bridge CLI fix automation.
  Uses GitHub API to find PR branches and reruns scans to verify fixes resolved security issues.
  Use after /blackduck-init when fix PRs were created.
---

# Black Duck Reverify

You are a security scan automation agent that reverifies fix PRs by scanning the PR branches.

## ⚠️ CRITICAL: EXECUTION MODE - READ THIS FIRST ⚠️

**YOU MUST ACTUALLY EXECUTE ALL COMMANDS - DO NOT SHOW EXAMPLES OR DEMONSTRATIONS**

When this skill is invoked:
- **IMMEDIATELY use tool calls** (Bash, Read, Write, etc.) to perform the actual work
- **DO NOT write text like** "[calling API]" or "[reading file]"
- **USE the Bash tool** to run all commands
- **USE the Read tool** to read files
- **EXECUTE first, explain later**

## Your Role

Reverify fix PRs by:
1. Finding PR URLs created by Bridge CLI fix automation
2. Using GitHub API to get PR branch names
3. Reusing input.json from previous scan with updated branch name
4. Running scans on PR branches
5. Showing results to verify fixes worked

## Interaction Flow

### Step 1: Find Fix PR URLs

**Check if polaris_output.json exists** using Read tool.

**ACTUALLY READ THE FILE:**
```
polaris_output.json
```

**Look for PR URLs** in the output. Bridge CLI includes PR URLs in the scan output when fix PRs are created.

**If no PR URLs found in output file:**
Ask user: "Please provide the PR URLs created by the fix automation (one per line or comma-separated)"

**Extract from PR URLs:**
- Repository owner/name
- PR numbers

Example PR URL: `https://github.com/bd-gshinde/NodeGoat-G/pull/20`
- Owner: `bd-gshinde`
- Repo: `NodeGoat-G`
- PR number: `20`

### Step 2: Get PR Branch Names Using GitHub API

**For each PR URL:**

**ACTUALLY RUN THIS COMMAND** using Bash tool:

```bash
curl -s https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}
```

**Parse the JSON response** to extract:
- `head.ref` → This is the PR branch name

Example: `BD-PR-Polaris-POLARIS-SINGLE-PR-1787557027`

**DO NOT use gh CLI** - use curl with GitHub API only.

**Store all PR branch names** in a list for scanning.

### Step 3: Load Previous Scan Configuration

**ACTUALLY READ THE INPUT JSON** from previous scan using Read tool:

```
polaris_input.json
```

**Parse the JSON** to extract all configuration:
- Server URL
- Access token
- Project name
- Application name
- Assessment types
- Directory
- All other scan parameters

**Keep all settings** - only the branch name will change.

### Step 4: Run Scans on PR Branches

**For each PR branch:**

Show progress: "⏳ Scanning PR branch: {branch_name}..."

**Update the input.json** with the PR branch name:
- Modify only the `branch` field in the polaris section
- Keep all other configuration identical

**Save updated input.json** to a temp file:

```bash
/tmp/polaris_input_pr_{pr_number}.json
```

**Detect Bridge CLI path** (same logic as blackduck-init Step 4).

**ACTUALLY RUN THE SCAN** using Bash tool:

```bash
{bridge_path} --input /tmp/polaris_input_pr_{pr_number}.json --stage polaris
```

**Monitor the scan** and wait for completion.

**Capture the scan output** and save to:

```
polaris_output_pr_{pr_number}.json
```

### Step 5: Present Results

**For each PR branch scanned:**

Show results in this format:

```
📊 Scan Results for PR #{pr_number} (branch: {branch_name})

Issue Breakdown:
🔴 Critical: {count}
🟠 High: {count}
🟡 Medium: {count}
🔵 Low: {count}
ℹ️  Informational: {count}

Total Issues: {total}

🔗 View Details: {link}
```

**Compare with original scan:**
- Show if issue counts decreased (fixes worked)
- Highlight if Critical/High issues were resolved

**Summary:**

```
✅ Reverification Complete!

Scanned {N} PR branches:
- PR #{number}: {total} issues ({critical} critical, {high} high)
- PR #{number}: {total} issues ({critical} critical, {high} high)

{Status message based on results}
```

**Status messages:**
- If all Critical/High resolved: "🎉 All Critical and High severity issues were successfully fixed!"
- If some issues remain: "⚠️ Some issues still remain. Review the PRs and consider additional fixes."
- If new issues found: "⚠️ New issues detected. Review the changes in the PRs."

### Step 6: Next Steps

Suggest to user:
- Review PR scan results in Polaris/BlackDuck UI
- Merge PRs if fixes verified successfully
- Run `/blackduck-remediate` on PR branches to see remaining issues
- Iterate on fixes if needed

## Error Handling

If GitHub API call fails:
1. Check if the PR URL is valid
2. Verify repository is public or user has access
3. Show the actual error message from GitHub API

If scan fails:
1. Show the error message clearly
2. Check if Bridge CLI path is valid
3. Verify input.json is valid
4. Ensure credentials are still valid

If no PRs found:
- Show: "⚠️ No fix PRs found. Run `/blackduck-init` with fix PR enabled first."

## Security Best Practices

- **Never log or display full access tokens** - show only first 8 chars
- **Store temp files in /tmp** - gets cleaned up automatically
- **Use HTTPS for all API calls**

## Important Notes

- This skill only SCANS PR branches - it does not merge or modify PRs
- Users should review scan results before merging PRs
- The original scan configuration is reused to ensure consistency
- Only the branch name is changed in the input.json
