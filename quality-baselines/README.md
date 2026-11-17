# Code quality baselines

Pull requests run the build, ESLint, TypeScript, tests, and coverage checks. The
repository has existing lint, type, and coverage debt, so the checks preserve
the current state as a floor and reject regressions.

- `eslint-suppressions.json` is ESLint's native bulk-suppression file. New
  findings are not suppressed and fail `npm run lint`. After resolving existing
  findings, run `npm run lint:baseline` and commit the smaller baseline.
- `typescript.json` fingerprints known diagnostics by file, error code, and
  full message (including nested continuation lines), recording counts and a
  representative source location. Line and column movement does not fail
  `npm run typecheck`; a new diagnostic identity or a higher count does. A
  reduction below the baseline does **not** fail the gate — it prints a
  non-failing advisory, so a baseline generated in a less-complete environment
  cannot block an unrelated PR. The check regenerates generated sources first so
  clean checkouts are deterministic. Run `npm run typecheck:baseline` after
  reviewing the compiler output to tighten the baseline.
- `coverage.json` records the maximum uncovered branch, function, line, and
  statement counts. `npm run test:ci` fails only on regressions beyond those
  counts. An improvement passes with a non-failing advisory; run
  `npm run coverage:baseline` afterwards to lock in the gain so it cannot become
  spare capacity for a later change.
