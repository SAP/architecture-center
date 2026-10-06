import { sanitizeLinkUrl } from '../sanitization';

describe('sanitizeLinkUrl', () => {
    it('preserves absolute http(s) and mailto links', () => {
        expect(sanitizeLinkUrl('https://example.com/a?b=1#c')).toBe('https://example.com/a?b=1#c');
        expect(sanitizeLinkUrl('http://example.com')).toBe('http://example.com');
        expect(sanitizeLinkUrl('mailto:a@b.com')).toBe('mailto:a@b.com');
    });

    it('preserves relative, anchor and query links (the regression this fixes)', () => {
        expect(sanitizeLinkUrl('../page#section')).toBe('../page#section');
        expect(sanitizeLinkUrl('/docs/foo?tab=bar&x=1')).toBe('/docs/foo?tab=bar&x=1');
        expect(sanitizeLinkUrl('#heading')).toBe('#heading');
    });

    it('blocks dangerous schemes', () => {
        expect(sanitizeLinkUrl('javascript:alert(1)')).toBe('');
        expect(sanitizeLinkUrl('JavaScript:alert(1)')).toBe('');
        expect(sanitizeLinkUrl('data:text/html,<script>alert(1)</script>')).toBe('');
        expect(sanitizeLinkUrl('vbscript:msgbox(1)')).toBe('');
    });

    it('blocks obfuscated schemes (whitespace / control chars / leading space)', () => {
        expect(sanitizeLinkUrl('  javascript:alert(1)')).toBe('');
        expect(sanitizeLinkUrl('java\tscript:alert(1)')).toBe('');
        expect(sanitizeLinkUrl('java\nscript:alert(1)')).toBe('');
        expect(sanitizeLinkUrl('\u0001javascript:alert(1)')).toBe('');
    });

    it('handles empty / non-string input safely', () => {
        expect(sanitizeLinkUrl('')).toBe('');
        expect(sanitizeLinkUrl('   ')).toBe('');
        // @ts-expect-error exercising defensive runtime guard
        expect(sanitizeLinkUrl(null)).toBe('');
    });
});
