import * as fs from 'fs';
import * as path from 'path';

// The plugin is CommonJS; require it to reach the exported CSP source.
const { buildCsp } = require('../index.js') as {
    buildCsp: (opts?: { forMeta?: boolean }) => string;
};

/**
 * Guards against CSP drift. The committed vercel.json is NOT regenerated at
 * build time (postBuild only writes it when absent), so without this test a
 * change to CSP_DIRECTIVES would silently diverge from the headers Vercel
 * actually applies. If this fails, regenerate vercel.json to match buildCsp().
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

    // The <meta> CSP and the response-header CSP are both enforced in production
    // (Cloudflare Pages serves _headers AND the page carries a <meta> tag); the
    // browser applies their INTERSECTION. These tests lock the invariant that
    // the two differ ONLY by directives that are invalid inside <meta>, so the
    // intersection equals the intended policy and nothing legitimate is blocked.
    describe('meta vs header policy coherence', () => {
        it('meta CSP omits frame-ancestors (invalid in <meta>) but keeps everything else', () => {
            const header = buildCsp();
            const meta = buildCsp({ forMeta: true });
            expect(header).toContain('frame-ancestors');
            expect(meta).not.toContain('frame-ancestors');
            // Removing the frame-ancestors directive from the header string must
            // yield exactly the meta string — i.e. no other divergence exists.
            const headerWithoutFrameAncestors = header
                .replace(/frame-ancestors[^;]*;\s*/, '')
                .trim();
            expect(meta).toBe(headerWithoutFrameAncestors);
        });

        // Regression guard: these origins were dropped by an earlier revision and
        // would break production (RA0005 Kaltura video, drawio viewer + editor,
        // Cloudflare analytics) once the CSP is actually enforced. Keep them in
        // the union.
        it.each([
            'https://cdnapisec.kaltura.com',
            'https://viewer.diagrams.net',
            'https://embed.diagrams.net',
            'https://static.cloudflareinsights.com',
            'https://cloudflareinsights.com',
            "worker-src 'self' blob:",
        ])('CSP union still allows %s', (needle) => {
            expect(buildCsp()).toContain(needle);
        });
    });
});
