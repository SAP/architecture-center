const { cspDirectives } = require('../csp-config') as {
    cspDirectives: Array<[string, string[]]>;
};

const directives = new Map(cspDirectives);

describe('Quick Start Content Security Policy', () => {
    it('allows the production APIs used by Quick Start', () => {
        expect(directives.get('connect-src')).toEqual(
            expect.arrayContaining([
                'https://architecture-center-auth.cfapps.eu10-005.hana.ondemand.com',
                'https://sap-architecture-center-quickstart-cap-port-ij290co9-pr61a3cf31.cfapps.eu10-005.hana.ondemand.com',
            ])
        );
    });

    it('allows the Draw.io editor and renderer in only the required resource directives', () => {
        expect(directives.get('frame-src')).toContain('https://embed.diagrams.net');
        expect(directives.get('frame-src')).not.toContain('https://viewer.diagrams.net');
        expect(directives.get('script-src')).toContain('https://viewer.diagrams.net');
        expect(directives.get('script-src')).not.toContain('https://embed.diagrams.net');
        expect(directives.get('connect-src')).not.toContain('https://embed.diagrams.net');
        // viewer.diagrams.net is loaded as a script AND fetches diagram data at
        // runtime, so it is intentionally allowed in both script-src and connect-src.
        expect(directives.get('connect-src')).toContain('https://viewer.diagrams.net');
    });
});
