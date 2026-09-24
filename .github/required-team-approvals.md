# Required team approvals

This document explains the `required-team-approvals` GitHub Action defined in
[`.github/workflows/required-team-approvals.yml`](./workflows/required-team-approvals.yml)
and how to set it up.

Written for: repository admins configuring branch protection.

## Why this exists

The review policy is asymmetric:

- The **admin** team (`@OCTO/architecture-center-admin`) must approve **every**
  pull request, whatever it changes.
- The **reviewer** team (`@OCTO/architecture-center-reviewer`) must approve
  **only** pull requests that touch the paths it owns in
  [`.github/CODEOWNERS`](./CODEOWNERS).
- When a pull request touches reviewer-owned paths, **both** teams must approve.

Native GitHub cannot express this. On any single file, code-owner review
requires just **one** approval from the owners on the last matching line, so you
can never force two distinct teams to both approve the same file. The
count-based "Required approvals: N" setting is also no help, because it counts
total approvals and cannot distinguish teams — two reviewer approvals would
satisfy `N=2` with no admin sign-off.

This workflow encodes the policy explicitly and reports a single required status
check, `required-team-approvals`.

## What the workflow does, step by step

### When it runs (the triggers)

The workflow runs on two kinds of events:

1. **`pull_request_target`** for `opened`, `reopened`, `synchronize` (new
   commits pushed), and `ready_for_review`. This variant is used instead of the
   ordinary `pull_request` so the workflow can read the secret token even when
   the pull request comes from a fork. It never runs any code from the pull
   request itself, so that is safe here.
2. **`pull_request_review`** for `submitted`, `edited`, and `dismissed`. This
   re-checks the policy each time someone approves, edits, or has an approval
   dismissed.

Together these mean the check re-evaluates whenever anything that could change
the answer happens: new commits, or a review coming or going.

### Concurrency and permissions

- **`concurrency`** groups runs by pull request number and cancels an
  in-progress run when a newer event arrives, avoiding a race between two runs
  writing conflicting statuses.
- **`permissions: contents: read`** limits the built-in token to reading files.
  All write work uses the separate token instead.

### Step 1 — Check out CODEOWNERS

The first job step does a **sparse checkout** of just `.github/CODEOWNERS`,
nothing else. It pins the checkout to `github.event.pull_request.base.sha`, the
commit the pull request is based on. This does two things:

- It reads the base version, not the pull request's version, so a fork cannot
  rewrite the rules to weaken them. `base.sha` is a commit on the base branch,
  which a fork author cannot push to, so it stays trusted.
- It reads the CODEOWNERS of the pull request's own base branch on **both**
  triggers. Without the pin, a `pull_request_review` run would default to the
  repository's default branch (`main`), which is wrong when a pull request
  targets another branch such as `dev`.

### Step 2 — Evaluate approvals

The second step runs a script with the `TEAM_REVIEW_TOKEN` secret. The built-in
Actions token cannot read org team membership, which is why a dedicated token is
passed here. The script does five things:

1. **Derive the reviewer-owned paths.** It reads the checked-out CODEOWNERS,
   drops comments and blank lines, and for every rule whose owners include the
   reviewer team it records that path. The catch-all `*` line is skipped because
   it belongs to the admin team. This keeps CODEOWNERS the single source of
   truth — change ownership there and the policy follows.
2. **Find who actually approved.** It pages through every review on the pull
   request and keeps only each person's *latest* review state. Someone who
   approved and then had it dismissed, or who later requested changes, does not
   count. The result is the set of current approvers.
3. **Look up team membership.** It fetches the member lists of both the admin
   and reviewer teams, then checks whether any current approver belongs to each
   team. This is the part that needs the org-read token.
4. **Check what the pull request touches.** It lists the changed files and asks
   whether any fall under a reviewer-owned path. Directory rules match by
   prefix, single-file rules match exactly.
5. **Apply the policy and report.** It builds a list of missing approvals: admin
   is required always, reviewer is required only if the pull request touched
   reviewer-owned paths. If nothing is missing it posts a **success** commit
   status named `required-team-approvals`. If something is missing it posts a
   **failure** status naming which team is still needed, and fails the job.

### The safety net

The whole evaluation is wrapped so that if anything throws — for example a
missing or under-scoped token — it posts an **error** status instead of silently
passing. A misconfiguration blocks the merge rather than letting a pull request
through unchecked.

### How it blocks merging

The script writes its verdict as the commit status `required-team-approvals` on
the pull request's head commit. On its own that status is only advisory. It
stops merges only once the status is added as a required status check on the
protected branch (see setup below).

End to end: someone approves, the review event fires, the script recomputes
admin-and-maybe-reviewer coverage, and it flips the required status green or red
accordingly.

## Setup

Two things must be configured in GitHub before the workflow enforces anything.

### 1. Add the `TEAM_REVIEW_TOKEN` secret

> **This repository lives on the internal SAP GitHub (`github.tools.sap`), not
> github.com.** Create the token and add the secret on that host. A token
> generated on github.com will not work — the `OCTO` org and this repository
> only exist on `github.tools.sap`.

Reading org team membership is impossible with the built-in Actions token, so
the workflow needs its own. Use a fine-grained personal access token (or a
GitHub App installation token) owned by the `OCTO` org with:

```
Organization permissions → Members: Read-only
Repository permissions   → Commit statuses: Read and write
                           Pull requests:  Read-only
                           Contents:       Read-only
```

A classic PAT with scopes `repo` + `read:org` also works.

Create the token at `https://github.tools.sap/settings/personal-access-tokens/new`
(fine-grained) or `https://github.tools.sap/settings/tokens/new` (classic), then
add it under **`github.tools.sap` → repo Settings → Secrets and variables →
Actions → New repository secret**, named exactly `TEAM_REVIEW_TOKEN`.

### 2. Make the check required on the protected branch

In the branch protection rule (or ruleset) for `main`:

- Turn on **Require a pull request before merging**.
- Turn on **Require status checks to pass** and add `required-team-approvals`.
- Turn on **Do not allow bypassing the above settings** so admins cannot merge
  around it.

The check name only appears in that list after the workflow has run once, so
open a throwaway test pull request first, then select it.

Once this is in place you no longer need the count-based "Required approvals: N"
setting for the team logic, and you can turn off native "Require review from
Code Owners" if you like. The Action is authoritative. Keep CODEOWNERS — it
still auto-requests the right reviewers and now also drives the reviewer-path
list.

## Things to verify

- The two team slugs are literally `architecture-center-admin` and
  `architecture-center-reviewer` in the `OCTO` org. The workflow derives them
  from the org name plus those slugs, matching the CODEOWNERS entries.
