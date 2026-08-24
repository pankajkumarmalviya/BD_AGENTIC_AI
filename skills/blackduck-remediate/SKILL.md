---
name: blackduck-remediate
description: >
  Fetches Polaris security issues via API and generates a detailed remediation report.
  Extracts issue names, remediation steps, and issue IDs for review.
  Use when user wants to view detailed issues after running /blackduck-init scan.
---

# Black Duck Remediate

You are a Polaris issue reporter that fetches security findings from Polaris and generates a detailed remediation report.

## ⚠️ CRITICAL: EXECUTION MODE - READ THIS FIRST ⚠️

**YOU MUST ACTUALLY EXECUTE ALL COMMANDS - DO NOT SHOW EXAMPLES OR DEMONSTRATIONS**

When this skill is invoked:
- **IMMEDIATELY use tool calls** (Bash, Read, Write, etc.) to perform the actual work
- **DO NOT write text like** "[fetching issues]" or "[calling API]" or "[parsing response]"
- **DO NOT show what you would do** - ACTUALLY DO IT using the available tools
- **USE the Bash tool** to run all curl commands
- **USE the Read tool** to read credentials and output files
- **USE the Write tool** to create the markdown report
- **EXECUTE first, explain later** - run the tools before telling the user what you're doing

## Your Role

Fetch Polaris security issues and create a detailed report by:
1. **Loading credentials** from ~/credentials.json (Polaris URL + Access Token)
2. **Extracting IDs** from the Polaris results or asking user
3. **Calling Polaris API** to fetch all issues
4. **Parsing response** and extracting issue details
5. **Generating markdown report** in project root

## Interaction Flow

### Step 1: Load Polaris Credentials

**ACTUALLY READ THE CREDENTIALS FILE** using the Read tool:

```
/Users/gshinde/credentials.json
```

**DO NOT write "[reading credentials]" - ACTUALLY use the Read tool.**

Extract:
- `polaris.serverUrl` (e.g., "https://poc.polaris.blackduck.com")
- `polaris.accessToken` (for API authentication)

If credentials not found, inform user: "⚠️ Polaris credentials not found. Please run `/blackduck-init` first."

### Step 2: Get Project ID and Branch ID

**Check if polaris_output.json exists** in current directory using Read tool.

**ACTUALLY READ THE FILE** using the Read tool:

```
polaris_output.json
```

Parse the JSON to find the "View Details" URL or issue summary link.

**Extract from the URL:**
- `projectId`: The UUID in the path `.../projects/{projectId}/...`
- `branchId`: The UUID in query parameter `?branchId={branchId}`

**If polaris_output.json not found or IDs not in output:**
- Ask user: "Please provide the Polaris project URL from scan results"
- Extract projectId and branchId from the URL they provide

### Step 3: Fetch ALL Issues from Polaris API (with Pagination)

**Show progress:** "⏳ Fetching all issues from Polaris..."

**ACTUALLY RUN THIS NODE.JS SCRIPT** using the Bash tool:

```bash
node ~/.claude/skills/blackduck-remediate/cli/fetch-polaris-issues.js \
  --serverUrl "{serverUrl}" \
  --accessToken "{accessToken}" \
  --projectId "{projectId}" \
  --branchId "{branchId}" \
  --output /tmp/polaris-issues.json
```

**DO NOT write "[calling API]" - ACTUALLY execute this Node.js script.**

**Important:**
- Replace `{serverUrl}` with the server URL from credentials (e.g., "poc.polaris.blackduck.com")
- Replace `{projectId}` with extracted project ID
- Replace `{branchId}` with extracted branch ID
- Replace `{accessToken}` with access token from credentials

This Node.js script will:
- Fetch ALL issues from Polaris (handles pagination automatically)
- Fetch 100 issues per page until all issues are retrieved
- Show progress for each page
- Save all issues to /tmp/polaris-issues.json

### Step 4: Parse Issues Response

**ACTUALLY READ THE RESPONSE FILE** using the Read tool:

```
/tmp/polaris-issues.json
```

**DO NOT write "[parsing issues]" - ACTUALLY use the Read tool.**

**Parse the JSON structure:**
- The response contains `_items` array with issue objects
- For each issue in `_items`, extract from `occurrenceProps` array (find by `key`):
  - **Issue Title**: Find object with `key: "title"` → use `value`
  - **Issue Name**: Use `type._localized.name`
  - **Issue ID**: Use top-level `id`
  - **Severity**: Find object with `key: "severity"` → use `value` (critical, high, medium, low)
  - **Description**: Find object with `key: "description"` → use `value`
  - **Solution/Fix**: Find object with `key: "solution"` → use `value`
  - **Component**: Find object with `key: "component-name"` → use `value`
  - **Component Version**: Find object with `key: "component-version-name"` → use `value`
  - **CVE ID**: Find object with `key: "vulnerability-id"` → use `value`
  - **CWE**: Find object with `key: "cwe"` → use `value`
  - **Location**: Find object with `key: "location"` → use `value`

- For general remediation guidance, use: `type._localized.otherDetails` (find object with `key: "remediation"` → use `value`)

**If response is empty or has errors:**
- Check if API returned error message
- Inform user about the error
- Stop execution

### Step 5: Generate Markdown Table Report

**Show progress:** "⏳ Generating remediation report..."

**Create markdown table** with this structure:

```markdown
# Polaris Security Issues - Remediation Report

**Project ID:** {projectId}
**Branch ID:** {branchId}
**Generated:** {current date and time}
**Total Issues:** {count}

## Summary

- 🔴 Critical: {count}
- 🟠 High: {count}
- 🟡 Medium: {count}
- 🔵 Low: {count}

---

## Issues Table

| Issue ID | Component | Description | Remediation |
|----------|-----------|-------------|-------------|
| {issue-id} | {component-name}:{component-version} | {issue-title}<br>**Severity:** {severity}<br>**CVE:** {cve-id}<br>**CWE:** {cwe} | {solution-text} |
| ... | ... | ... | ... |

{Repeat for all issues, sorted by severity: Critical → High → Medium → Low}

---

📊 **View in Polaris:** https://{serverUrl}/portfolio/.../issues?branchId={branchId}
```

**How to extract fields from JSON:**
- **Issue ID**: Use top-level `id` field
- **Component**: Combine `component-name` + `:` + `component-version-name` from `occurrenceProps` array
- **Description**: Combine:
  - Issue title (from `occurrenceProps` where `key: "title"`)
  - Severity (from `occurrenceProps` where `key: "severity"`)
  - CVE ID (from `occurrenceProps` where `key: "vulnerability-id"`)
  - CWE (from `occurrenceProps` where `key: "cwe"`)
- **Remediation**: Get `solution` from `occurrenceProps` where `key: "solution"`

**Table formatting:**
- Use `<br>` for line breaks within cells
- Keep it concise - don't include full descriptions, just key info
- Sort by severity: Critical first, then High, Medium, Low

**ACTUALLY CREATE THE FILE** using the Write tool:

Write the markdown table to: `POLARIS_ISSUES.md` in current working directory

**DO NOT write "[creating file]" - ACTUALLY use the Write tool.**

### Step 6: Show Results to User

Show success message:

```
✅ Remediation report generated!

📊 Found {count} security issues:
- 🔴 Critical: {count}
- 🟠 High: {count}
- 🟡 Medium: {count}
- 🔵 Low: {count}

📄 Full report saved to: POLARIS_ISSUES.md

🔗 View in Polaris:
https://{serverUrl}/portfolio/.../issues?branchId={branchId}
```

**Ask user about applying fixes:**
"Would you like to apply automated fixes for these issues?"

**If user says YES:**
- Tell user: "Run `/blackduck-triage` to automatically apply fixes based on the remediation guidance in POLARIS_ISSUES.md."
- The AI assistant will then invoke the blackduck-triage skill

**If user says NO or wants to do it later:**
Suggest next steps:
- Review the issues in POLARIS_ISSUES.md
- Manually apply the recommended fixes
- Run `/blackduck-triage` later when ready to apply automated fixes
- Integrate this into your development workflow

## Error Handling

If API call fails:
1. Check if server URL is correct (should not include /api path)
2. Verify access token is valid
3. Confirm project ID and branch ID are correct
4. Check network connectivity
5. Show the actual error message from Polaris API

If no issues found:
- Show: "✅ No security issues found! Your code is clean."
- Do not create the markdown file

## Security Best Practices

- **Never log or display full access tokens** - show only first 8 chars
- **Store temp file in /tmp** - gets cleaned up automatically
- **Validate API response** before parsing to avoid errors

## Important Notes

- This skill only FETCHES and DISPLAYS issues - it does not apply fixes
- The markdown report is for manual review and planning
- Users should review remediation steps before applying any changes
- The temp file `/tmp/polaris-issues.json` can be deleted after report generation
