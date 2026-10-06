import * as fs from 'fs';
import * as path from 'path';

// The plugin is CommonJS; require it to reach the exported CSP source.
const { buildCsp } = require('../index.js') as { buildCsp: () => string };

/**
 * Guards against CSP drift. The committed vercel.json is NOT regenerated at
 * build time (postBuild only writes it when absent), so without this test a
 * change to CSP_DIRECTIVES would silently diverge from the headers Vercel
 * actually applies. If this fails, update vercel.json to match buildCsp().
 */
describe('security headers CSP', () => {
    const vercelJson = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, '../../../../vercel.json'), 'utf8'),
    );

    const findHeader = (key: string): string | undefined =>
        vercelJson.headers
            ?.flatMap((entry: { headers: { key: string; value: string }[] }) => entry.headers)
            .find((h: { key: string; value: string }) => h.key === key)?.value;

    it('committed vercel.json CSP matches the single CSP source (buildCsp)', () => {
        expect(findHeader('Content-Security-Policy')).toBe(buildCsp());
    });
});
