# blackduck-reverify

Reverifies fix PRs by running scans on PR branches created by Bridge CLI fix automation.

## Purpose

After Bridge CLI creates fix PRs for security vulnerabilities, this skill:
1. Finds the PR branches created by the fix automation
2. Reruns security scans on those branches
3. Verifies that the fixes resolved the security issues
4. Shows comparison with original scan results

## When to Use

Use this skill after running `/blackduck-init` with fix PR enabled, when Bridge CLI has created fix PRs.

## How It Works

1. **Find PR URLs**: Reads polaris_output.json or asks user for PR URLs
2. **Get Branch Names**: Uses GitHub API to find PR branch names from PR URLs
3. **Reuse Configuration**: Loads input.json from previous scan
4. **Update Branch**: Changes only the branch name in configuration
5. **Run Scans**: Executes scans on each PR branch
6. **Show Results**: Displays scan results and comparison with original scan

## Example Flow

```bash
# After running /blackduck-init with fix PR:
User: "Run /blackduck-reverify"

# Skill finds PR branches and scans them:
⏳ Scanning PR branch: BD-PR-Polaris-POLARIS-SINGLE-PR-1787557027...

📊 Scan Results for PR #20
🔴 Critical: 0 (was 5)
🟠 High: 2 (was 10)
🟡 Medium: 5 (was 5)

✅ Critical and High severity issues reduced!
```

## Requirements

- Previous `/blackduck-init` scan with fix PR enabled
- PR URLs from Bridge CLI fix automation
- GitHub API access (no authentication required for public repos)
- Valid Bridge CLI installation
- Existing polaris_input.json from previous scan

## Output

- Scan results for each PR branch
- Comparison with original scan
- Links to view details in Polaris/BlackDuck UI
- Status message about fix effectiveness
