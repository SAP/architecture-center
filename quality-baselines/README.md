# Code quality baselines

Pull requests run the build, ESLint, TypeScript, tests, and coverage checks. The
repository has existing lint, type, and coverage debt, so the checks preserve
the current state as a floor and reject regressions.

- `eslint-suppressions.json` is ESLint's native bulk-suppression file. New
  findings are not suppressed and fail `npm run lint`. After resolving existing
  findings, run `npm run lint:baseline` and commit the smaller baseline.
- `typescript.json` stores the exact number of known diagnostics for each file
  and TypeScript error code. `npm run typecheck` fails for added diagnostics and
  for a stale baseline after diagnostics are resolved. It regenerates the news
  data and page mapping first so a clean checkout produces the same result. Run
  `npm run typecheck:baseline` only after reviewing the compiler output.
- `jest.config.js` uses negative coverage thresholds, which Jest interprets as
  the maximum number of uncovered items. New uncovered code therefore fails the
  coverage check while added coverage passes.
