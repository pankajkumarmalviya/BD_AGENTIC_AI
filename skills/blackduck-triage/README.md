# Black Duck Triage Skill

Apply automated fixes to security issues found by Polaris scans.

## What It Does

This skill:
1. Reads issues from `POLARIS_ISSUES.md`
2. Asks which issues to fix (all/critical/specific)
3. Creates new branch `blackduck-fixes-{random-3-digit-id}`
4. Applies fixes one by one
5. Commits + pushes when user approves
6. Auto-creates PR/MR
7. Offers to re-scan to verify fixes

## Usage

After running `/blackduck-remediate`:

```
/blackduck-triage
```

The skill will:
1. Ask which issues to fix
2. Create new branch for fixes
3. Apply fixes iteratively (you can say "fix next" or "this is good")
4. Ask to commit and push
5. Create PR automatically
6. Offer to run `/blackduck-init` again to verify

## Example Flow

```
You: /blackduck-triage

AI: Would you like to fix these issues?
You: yes

AI: What would you like to fix?
    - Fix all issues (12 issues)
    - Fix critical only (3 issues) [Recommended]
    - Fix high and above (7 issues)
    - Target specific issue

You: Fix critical only

AI: ✅ Created branch: blackduck-fixes-247

    🔧 Fixing Issue #1/3: node-tar Vulnerable to Path Traversal

    **Severity:** Critical
    **Component:** isaacs_node-tar 4.4.8
    **Solution:** Upgrade to version 7.5.10

    ✅ Applied fix for: node-tar Vulnerable to Path Traversal

    Changed:
    - File: package.json
    - Fix: Upgraded tar from 4.4.8 to 7.5.10

    Would you like to continue? Say "fix next" or "this is good"

You: fix next

AI: [Applies fix #2...]

You: fix next

AI: [Applies fix #3...]

    All selected fixes applied!

    Would you like me to commit these changes and push?

You: yes

AI: ✅ Committed and pushed changes to branch blackduck-fixes-247
    ✅ Pull Request created: https://github.com/user/repo/pull/42

    Would you like to run a scan again to verify these fixes?

You: yes

AI: [Runs /blackduck-init on the new branch to verify fixes]
```

## Fix Types

**SCA Issues (Component Vulnerabilities):**
- Automatically upgrades package versions in:
  - `package.json` (npm)
  - `requirements.txt` (Python)
  - `pom.xml` (Maven)
  - `build.gradle` (Gradle)
  - Other package managers

**SAST Issues (Code Security):**
- Applies simple code pattern fixes
- Complex issues may need manual review
- Shows remediation guidance for manual fixes

## Branch Naming

Each triage session creates a NEW branch:
- `blackduck-fixes-123`
- `blackduck-fixes-456`
- `blackduck-fixes-789`

Random 3-digit ID ensures no conflicts.

## Commit Behavior

- **No auto-commits** during fixing
- Only commits when you say "yes" to commit/push
- All fixes committed together in one commit
- Detailed commit message lists all fixed issues

## Requirements

- Must have run `/blackduck-remediate` first
- Must be in a git repository
- Git must be configured (user.name, user.email)
- GitHub CLI (`gh`) must be installed for PR creation

## Workflow Integration

Complete security workflow:

1. `/blackduck-init` → Run scan
2. `/blackduck-remediate` → Fetch detailed issues
3. `/blackduck-triage` → Apply fixes
4. `/blackduck-init` → Re-scan to verify
5. (Repeat 3-4 until clean)

## Notes

- User controls which issues to fix
- User can stop fixing at any point
- Fixes can be reviewed before committing
- PR is created automatically after push
- Easy loop back to scanning for verification
