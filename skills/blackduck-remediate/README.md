# Black Duck Remediate Skill

Fetch detailed Polaris security issues and generate a remediation report.

## What It Does

This skill:
1. Loads Polaris credentials from `~/credentials.json`
2. Fetches **ALL** security issues from Polaris via API (handles pagination automatically)
3. Extracts issue details: Issue ID, Component, Description, Remediation
4. Generates a markdown table: `POLARIS_ISSUES.md` in your project root

## Usage

After running `/blackduck-init` scan:

```
/blackduck-remediate
```

The skill will:
- Ask for project/branch IDs (or extract from polaris_output.json)
- Fetch all issues from Polaris API
- Create `POLARIS_ISSUES.md` with detailed remediation steps

## Output Example

The generated `POLARIS_ISSUES.md` will contain:

```markdown
# Polaris Security Issues - Remediation Report

**Project ID:** abc-123-def
**Branch ID:** xyz-789-uvw
**Generated:** 2026-08-24 10:30:00
**Total Issues:** 408

## Summary

- 🔴 Critical: 10
- 🟠 High: 129
- 🟡 Medium: 245
- 🔵 Low: 24

---

## Issues Table

| Issue ID | Component | Description | Remediation |
|----------|-----------|-------------|-------------|
| ABC123DEF456 | node-tar:4.4.8 | node-tar Vulnerable to Arbitrary File Overwrite<br>**Severity:** critical<br>**CVE:** CVE-2021-37712<br>**CWE:** CWE-22 | Fixed in version **7.5.10**. Upgrade to the latest version. |
| XYZ789UVW012 | lodash:4.17.19 | Prototype Pollution in lodash<br>**Severity:** high<br>**CVE:** CVE-2020-8203<br>**CWE:** CWE-1321 | Fixed in version **4.17.21**. Update to patched version. |
| ... | ... | ... | ... |

---

📊 **View in Polaris:** https://poc.polaris.blackduck.com/portfolio/...
```

## Requirements

- Must have run `/blackduck-init` first to generate credentials
- Polaris access token must have API access
- Internet connection to call Polaris API

## Workflow

1. Run `/blackduck-init` to scan your code
2. When prompted, say "yes" to fetch detailed issues
3. Run `/blackduck-remediate` (or it will be auto-invoked)
4. Review `POLARIS_ISSUES.md` for all issue details
5. Manually apply fixes based on remediation steps

## Features

- **Pagination Support**: Fetches ALL issues (not just first 100)
- **Node.js Script**: Uses custom script for reliable API calls
- **Table Format**: Clean 4-column markdown table (Issue ID, Component, Description, Remediation)
- **Sorted by Severity**: Critical issues listed first
- **Complete Data**: Includes CVE, CWE, severity, and fix versions

## Notes

- This skill only FETCHES and DISPLAYS issues
- It does NOT automatically apply fixes to your code
- The markdown table is for manual review
- Temp API response is saved to `/tmp/polaris-issues.json`
- Use `/blackduck-triage` to apply automated fixes
