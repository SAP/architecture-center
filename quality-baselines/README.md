# Code quality baselines

Pull requests run the build, ESLint, TypeScript, tests, and coverage checks. The
repository has existing lint, type, and coverage debt, so the checks preserve
the current state as a floor and reject regressions.

- `eslint-suppressions.json` is ESLint's native bulk-suppression file. New
  findings are not suppressed and fail `npm run lint`. After resolving existing
  findings, run `npm run lint:baseline` and commit the smaller baseline.
- `typescript.json` fingerprints known diagnostics by file, source location,
  error code, and message. `npm run typecheck` fails when one diagnostic is
  exchanged for another and when the baseline becomes stale after a fix. It
  regenerates generated sources first so clean checkouts are deterministic. Run
  `npm run typecheck:baseline` only after reviewing the compiler output.
- `coverage.json` records the current uncovered branch, function, line, and
  statement counts. CI rejects regressions and improvements until the checked-in
  baseline is reduced, so added coverage cannot become spare capacity for a
  later change. Run `npm run coverage:baseline` after reviewing an improvement.
