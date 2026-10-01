# Required team approvals

This document explains the `required-team-approvals` check and how to set it up.
It is implemented as **two** workflows that hand off to each other:

- [`.github/workflows/required-team-approvals-trigger.yml`](./workflows/required-team-approvals-trigger.yml)
  — runs on the pull request and review events and records the pull request
  number as an artifact. It does no privileged work.
- [`.github/workflows/required-team-approvals.yml`](./workflows/required-team-approvals.yml)
  — runs on `workflow_run` after the trigger workflow, evaluates the policy with
  the `TEAM_REVIEW_TOKEN` secret, and posts the `required-team-approvals` commit
  status.

Why the split is required is explained in [Why two workflows](#why-two-workflows)
below.

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

### Why two workflows

Repository secrets are **not** passed to a workflow run triggered from a fork —
only the built-in read-only `GITHUB_TOKEN` is. The one exception is
`pull_request_target`, which is designed to run in the trusted base context with
secrets. There is **no** `pull_request_review_target` equivalent, so a
`pull_request_review` event on a fork pull request gets no secrets. If the
evaluation ran directly on that event, `${{ secrets.TEAM_REVIEW_TOKEN }}` would
expand to an empty string and the step would fail with
`Input required and not supplied: github-token` — every time a reviewer approves,
edits, or dismisses a review on a fork pull request.

The fix is to split the work:

1. **Collect** (`required-team-approvals-trigger.yml`) runs on the pull request
   and review events. It needs no secrets — it only writes the pull request
   number to an artifact. It uses `pull_request_target` for the lifecycle events
   so it also runs from the base definition for fork pull requests whose branch
   predates the workflow.
2. **Evaluate** (`required-team-approvals.yml`) runs on `workflow_run` after the
   collect workflow completes. A `workflow_run` always executes in the trusted
   base context **with** secrets, whatever triggered the upstream workflow — so
   the token is available even for fork pull requests. It downloads the pull
   request number artifact and evaluates the policy.

> **This takes effect only once both workflows are on the default branch
> (`main`).** `workflow_run` triggers off workflows in the default branch, so the
> change cannot be validated on its own pull request — it starts working after
> merge.

### When it runs (the triggers)

The **collect** workflow runs on two kinds of events:

1. **`pull_request_target`** for `opened`, `reopened`, `synchronize` (new
   commits pushed), and `ready_for_review`.
2. **`pull_request_review`** for `submitted`, `edited`, and `dismissed`.

Together these mean the check re-evaluates whenever anything that could change
the answer happens: new commits, or a review coming or going. Each collect run
triggers one **evaluate** run via `workflow_run`.

### Concurrency and permissions

- **`concurrency`** is applied at the `team-approvals` *job*, keyed by the pull
  request number, and cancels an in-progress run when a newer one for the same
  pull request arrives — avoiding a race between two runs writing conflicting
  statuses. It is deliberately **not** at the workflow level: the pull request
  number is not in the `workflow_run` event, and `workflow_run.head_sha` is the
  base commit for `pull_request_target`-triggered runs, so a workflow-level key
  would collide across unrelated pull requests and cancel the wrong evaluation.
  The number is only known after the `context` job reads it, so the job keys its
  concurrency off `needs.context.outputs.pr`. The **collect** workflow, by
  contrast, keys its concurrency at the workflow level off
  `github.event.pull_request.number` — that number *is* present in its triggering
  events, so superseded collect runs for the same pull request cancel cleanly.
- The evaluate workflow's built-in token needs only `contents: read` and
  `actions: read` (to download the artifact from the triggering run). All write
  work — reading team membership and posting the commit status — uses the
  separate `TEAM_REVIEW_TOKEN` instead.

### Step 1 — Recover the pull request context

The `context` job downloads the `team-approvals-pr-context` artifact from the
triggering run and reads the pull request number from it, exposing it as a job
output. It is guarded by `if: github.event.workflow_run.conclusion == 'success'`,
because `workflow_run` fires for every completed conclusion: a collect run that
was cancelled by its own concurrency (or failed) never uploaded the artifact, so
it is skipped rather than failing while downloading a missing one. (The artifact
is the only thing that crosses over from the upstream run;
`github.event.workflow_run.pull_requests` is empty for fork pull requests, which
is why the number is passed explicitly.) The `team-approvals` job then resolves
the current head and base commits of that pull request from the API, and reads
`.github/CODEOWNERS` via the API pinned to `base.sha` — a commit on the base
branch a fork author cannot push to, so the rules stay trusted and a fork cannot
weaken them.

### Step 2 — Evaluate approvals

The evaluate step runs a script with the `TEAM_REVIEW_TOKEN` secret. The built-in
Actions token cannot read org team membership, which is why a dedicated token is
passed here. The script does five things:

1. **Derive the reviewer-owned paths.** It reads the base CODEOWNERS,
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

Three things must be configured in GitHub before the workflow enforces anything.

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

To set it from the CLI instead, **you must prefix the repo with the host** —
otherwise `gh` targets github.com and fails with
`HTTP 404 .../repos/OCTO/architecture-center/actions/secrets/public-key`
(the `OCTO` org does not exist on github.com):

```
gh secret set TEAM_REVIEW_TOKEN --repo github.tools.sap/OCTO/architecture-center
```

Omit `--body` and `gh` prompts for the value, keeping the token out of your shell
history. Verify it landed on the internal host:

```
gh api repos/OCTO/architecture-center/actions/secrets --hostname github.tools.sap \
  --jq '.secrets[].name' | grep -Fx TEAM_REVIEW_TOKEN
# expect: TEAM_REVIEW_TOKEN
```

**Without this secret the workflow cannot run.** A missing (or empty) secret
makes `${{ secrets.TEAM_REVIEW_TOKEN }}` expand to an empty string, and the
`Evaluate team approvals` step fails with
`Input required and not supplied: github-token`. The same symptom appears if the
token has **expired** or was created on the wrong host, so re-check those first
when the check breaks.

> Note: the same `Input required and not supplied: github-token` error also
> appears if the evaluation is ever moved back onto a `pull_request_review`
> trigger. Fork pull requests receive no secrets on that event, so the token is
> empty there even when the secret is set correctly. That is exactly why the
> evaluation runs on `workflow_run` instead — see
> [Why two workflows](#why-two-workflows).

### 2. Grant the CODEOWNERS teams write access to the repository

The owner teams (`architecture-center-admin`, `architecture-center-reviewer`)
must each have **at least Write access** to this repository. A team merely
existing in the org is not enough: CODEOWNERS only resolves an owner if that team
both exists **and** has write access, so a team without access is silently
treated as an "Unknown owner" and **no reviewers are auto-requested** — the
Reviewers panel on new pull requests stays empty.

> This is a separate requirement from the token. The `Evaluate team approvals`
> step can still read team *membership* through `TEAM_REVIEW_TOKEN` even when a
> team has no repo access, so the approval check and the auto-request of
> reviewers can break independently.

Add each team under **`github.tools.sap` → repo Settings → Collaborators and
teams → Add teams**, with the **Write** role (give admin Maintain/Admin if you
also want them managing repo settings). From the CLI:

```
gh api -X PUT orgs/OCTO/teams/architecture-center-admin/repos/OCTO/architecture-center       --hostname github.tools.sap -f permission=push
gh api -X PUT orgs/OCTO/teams/architecture-center-reviewer/repos/OCTO/architecture-center     --hostname github.tools.sap -f permission=push
```

Verify CODEOWNERS resolves cleanly (again, mind the internal host):

```
gh api repos/OCTO/architecture-center/codeowners/errors --hostname github.tools.sap
# expect: {"errors": []}
```

Any `Unknown owner` entry here names a team that is missing, not visible, or
without write access. Note that fixing this does **not** retroactively populate
reviewers on already-open pull requests — auto-request fires at pull request
creation or when new commits are pushed.

### 3. Make the check required on the protected branch

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

- The team slugs are literally `architecture-center-admin` and
  `architecture-center-reviewer` in the `OCTO` org. The workflow derives the
  admin and reviewer slugs from the org name plus those slugs, matching the
  CODEOWNERS entries.
- Both teams have **Write access** to the repository (see step 2), otherwise
  CODEOWNERS reports them as `Unknown owner` and stops auto-requesting reviewers.
