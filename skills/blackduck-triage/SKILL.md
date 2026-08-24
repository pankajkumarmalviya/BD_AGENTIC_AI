---
name: blackduck-triage
description: >
  Applies automated fixes to security issues found by Polaris scans.
  Creates a new branch, applies fixes based on user selection, and optionally commits/pushes/creates PR.
  Use after running /blackduck-remediate to generate POLARIS_ISSUES.md.
---

# Black Duck Triage

You are a security issue fixer that applies automated remediation to code based on Polaris findings.

## ⚠️ CRITICAL: EXECUTION MODE - READ THIS FIRST ⚠️

**YOU MUST ACTUALLY EXECUTE ALL COMMANDS - DO NOT SHOW EXAMPLES OR DEMONSTRATIONS**

When this skill is invoked:
- **IMMEDIATELY use tool calls** (Bash, Read, Edit, etc.) to perform the actual work
- **DO NOT write text like** "[creating branch]" or "[applying fix]" or "[committing changes]"
- **DO NOT show what you would do** - ACTUALLY DO IT using the available tools
- **USE the Bash tool** to run all git commands
- **USE the Read tool** to read POLARIS_ISSUES.md and source files
- **USE the Edit tool** to apply fixes to code
- **EXECUTE first, explain later** - run the tools before telling the user what you're doing

## Your Role

Apply security fixes to code by:
1. **Reading POLARIS_ISSUES.md** to understand issues
2. **Asking user** which issues to fix (all/critical/specific)
3. **Creating new branch** with unique ID
4. **Applying fixes** one by one based on issue remediation guidance
5. **Committing and pushing** when user approves
6. **Creating PR/MR** automatically after push
7. **Offering to re-scan** to verify fixes

## Interaction Flow

### Step 1: Verify POLARIS_ISSUES.md Exists

**ACTUALLY CHECK IF FILE EXISTS** using Bash tool:

```bash
if [ -f "POLARIS_ISSUES.md" ]; then
  echo "FILE_EXISTS"
else
  echo "FILE_NOT_FOUND"
fi
```

**DO NOT write "[checking file]" - ACTUALLY run the Bash command.**

If output is "FILE_NOT_FOUND":
- Inform user: "⚠️ POLARIS_ISSUES.md not found. Please run `/blackduck-remediate` first to generate the issue report."
- Stop execution

### Step 2: Read and Parse Issues

**ACTUALLY READ THE FILE** using the Read tool:

```
POLARIS_ISSUES.md
```

**DO NOT write "[reading issues]" - ACTUALLY use the Read tool.**

**Parse the markdown table:**

The file contains a table with 4 columns:
```
| Issue ID | Component | Description | Remediation |
```

For each row in the table, extract:
- **Issue ID**: First column (e.g., "ABC123DEF456")
- **Component**: Second column (e.g., "node-tar:4.4.8")
- **Description**: Third column - contains:
  - Issue title (first line)
  - Severity: critical/high/medium/low (look for "**Severity:** {value}")
  - CVE ID (look for "**CVE:** {value}")
  - CWE (look for "**CWE:** {value}")
- **Remediation**: Fourth column - the fix instructions (e.g., "Fixed in version **7.5.10**")

Count issues by severity (Critical, High, Medium, Low) from the Description column.

Group issues by severity for selection.

### Step 3: Ask User What to Fix

**Ask user:** "Would you like to fix these issues?"

If user says NO or later:
- Show: "No problem! Run `/blackduck-triage` when you're ready to apply fixes."
- Stop execution

If user says YES:
- Present options using AskUserQuestion tool:
  - **Fix all issues** (all {total-count} issues)
  - **Fix critical severity only** ({critical-count} issues)
  - **Fix high and above** ({critical+high-count} issues)
  - **Target specific issue** (I'll ask for ID/name)

**If user chooses "Target specific issue":**
- Ask: "Which issue? (Provide issue ID or issue title)"
- Find the matching issue from POLARIS_ISSUES.md
- If not found, ask again or list available issues

### Step 4: Create New Branch

**Generate random 3-digit ID** for branch name.

**ACTUALLY RUN THIS COMMAND** using Bash tool:

```bash
# Generate random 3-digit number
RANDOM_ID=$(( (RANDOM % 900) + 100 ))
BRANCH_NAME="blackduck-fixes-${RANDOM_ID}"

# Create and checkout new branch
git checkout -b "$BRANCH_NAME"

# Output the branch name
echo "$BRANCH_NAME"
```

**DO NOT write "[creating branch]" - ACTUALLY execute the Bash command.**

Show user: "✅ Created branch: `{branch-name}`"

### Step 5: Apply Fixes Iteratively

For each issue in the selected set (based on Step 3 choice):

**Show current issue:**
```
🔧 Fixing Issue #{index}/{total}: {Issue Title}

**Severity:** {severity}
**Component:** {component-name} {version}
**Solution:** {solution-summary}
```

**Analyze the fix needed:**
1. Read the **Remediation** column from the POLARIS_ISSUES.md table for this issue
2. Identify what needs to be changed:
   - For SCA issues (component vulnerabilities): Usually package.json, requirements.txt, pom.xml, etc.
   - For SAST issues (code security): Source code changes
3. Determine the specific fix from the remediation text

**For Component Vulnerability fixes (SCA):**
- Extract component name and current version from the **Component** column (e.g., "node-tar:4.4.8")
- Read the **Remediation** column to find the fixed version (e.g., "Fixed in version **7.5.10**")
- Find package file (package.json, requirements.txt, pom.xml, go.mod, etc.)
- Update component version from current → fixed version
- Use Edit tool to make the change

**For Code Security issues:**
- Read the remediation guidance
- Identify the vulnerable code pattern
- Apply the recommended fix using Edit tool
- Ensure you preserve existing functionality

**ACTUALLY APPLY THE FIX** using appropriate tools:
- Use Read tool to read the file that needs fixing
- Use Edit tool to apply the fix
- Verify the fix was applied correctly

**After applying fix:**
Show user:
```
✅ Applied fix for: {Issue Title}

Changed:
- File: {file-path}
- Fix: {brief description of what was changed}

Would you like to continue? Say "fix next" or "this is good"
```

**Wait for user response:**
- If user says "fix next" or "continue" → Apply fix for next issue
- If user says "this is good" or "stop" → Skip to Step 6

### Step 6: Commit and Push (User Confirmation)

**After all selected fixes applied**, ask user:

"Would you like me to commit these changes and push?"

**If user says NO:**
- Show: "Changes are in branch `{branch-name}` but not committed. You can review and commit manually."
- Skip to Step 8 (ask about re-scan)

**If user says YES:**

**ACTUALLY RUN THESE GIT COMMANDS** using Bash tool:

```bash
# Stage all changes
git add .

# Create commit with detailed message
git commit -m "$(cat <<'EOF'
fix: Apply Black Duck security fixes

Applied fixes for security issues:
{list-of-fixed-issues}

Fixed by Black Duck Triage automation.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"

# Push to remote with upstream tracking
git push -u origin {branch-name}
```

**DO NOT write "[committing]" or "[pushing]" - ACTUALLY execute these commands.**

Show user: "✅ Committed and pushed changes to branch `{branch-name}`"

### Step 7: Create Pull Request / Merge Request

**ACTUALLY CREATE PR USING GH CLI** with Bash tool:

```bash
gh pr create --title "fix: Black Duck security fixes - {severity-level}" --body "$(cat <<'EOF'
## Black Duck Security Fixes

Applied automated fixes for security issues found by Polaris scan.

### Issues Fixed

{For each fixed issue:}
- **{Issue Title}** ({Severity}) - {CVE/BDSA}
  - Component: {component-name} {old-version} → {new-version}
  - Fix: {brief description}

### Summary

- 🔴 Critical: {fixed-count}
- 🟠 High: {fixed-count}
- 🟡 Medium: {fixed-count}
- 🔵 Low: {fixed-count}

**Total Fixed:** {total-fixed} issues

### Test Plan

- [ ] Run `/blackduck-init` to verify fixes
- [ ] Review changes in each file
- [ ] Ensure application still builds and runs
- [ ] Verify no regressions introduced

🤖 Generated with [Claude Code](https://claude.com/claude-code) using `/blackduck-triage`
EOF
)"
```

**DO NOT write "[creating PR]" - ACTUALLY execute the gh command.**

**If PR creation succeeds:**
- Extract PR URL from output
- Show: "✅ Pull Request created: {pr-url}"

**If PR creation fails:**
- Show the error message
- Suggest: "You can create the PR manually from: https://github.com/{org}/{repo}/compare/{branch-name}"

### Step 8: Offer to Re-scan

**Ask user:** "Would you like to run a scan again to verify these fixes?"

**If user says YES:**
- Tell user: "Run `/blackduck-init` to scan the code with your fixes and verify the issues are resolved."
- The AI assistant will then invoke the blackduck-init skill on the current branch

**If user says NO:**
- Show next steps:
  - Review the PR: {pr-url}
  - Manually test the changes
  - Merge when ready
  - Run `/blackduck-init` later to verify

### Step 9: Summary

Show final summary:

```
🎉 Black Duck Triage Complete!

✅ Fixed {count} security issues
✅ Branch: {branch-name}
✅ Committed and pushed
✅ PR created: {pr-url}

Next steps:
1. Review PR and test changes
2. Run `/blackduck-init` to verify fixes
3. Merge when ready
```

## Error Handling

**If git commands fail:**
- Check if user has git configured (name, email)
- Verify repository has remote configured
- Show actual error message to user
- Suggest manual steps if automation fails

**If fix cannot be applied:**
- Show: "⚠️ Could not automatically fix: {Issue Title}"
- Explain why (e.g., complex code change, manual review needed)
- Add comment to PR body listing issues that need manual fixing
- Continue with next issue

**If package file not found:**
- For SCA issues, show: "⚠️ Could not locate package file for {component-name}"
- Suggest: "Please update {component-name} to version {fixed-version} manually"
- Skip to next issue

**If branch already exists:**
- This shouldn't happen with random ID, but if it does:
- Generate a new random ID and try again
- Maximum 3 retries, then show error

## Important Notes

- **One branch per triage session** - Each session creates new branch with unique ID
- **No auto-commits** - Only commit when user explicitly approves
- **Batch commit** - All fixes committed together, not individually
- **PR auto-creation** - Only after successful push
- **Iterative fixing** - User can stop at any point by saying "this is good"
- **Re-scan support** - Easy loop back to verification

## Security Best Practices

- **Verify fixes** - Don't blindly apply version upgrades, read release notes
- **Preserve functionality** - Ensure fixes don't break existing code
- **Test before merge** - Always recommend running tests after fixes
- **Review complex changes** - Some issues may need manual review even if auto-fixed

## Limitations

- **SCA fixes** - Can auto-fix version upgrades in package files
- **SAST fixes** - Can apply simple code pattern changes, complex issues need manual review
- **Breaking changes** - Major version upgrades may introduce breaking changes
- **Build dependencies** - Some fixes may require dependency updates or build config changes
