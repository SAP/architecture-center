import { sanitizeLinkUrl, sanitizeImageSrc } from '../sanitization';

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

describe('sanitizeImageSrc', () => {
    it('preserves http(s), blob, relative and anchor image sources', () => {
        expect(sanitizeImageSrc('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
        expect(sanitizeImageSrc('http://example.com/a.png')).toBe('http://example.com/a.png');
        expect(sanitizeImageSrc('blob:https://example.com/uuid')).toBe('blob:https://example.com/uuid');
        expect(sanitizeImageSrc('../img/foo.png')).toBe('../img/foo.png');
        expect(sanitizeImageSrc('/assets/foo.png?v=2')).toBe('/assets/foo.png?v=2');
    });

    it('preserves inline image data URLs (unlike sanitizeLinkUrl)', () => {
        const png = 'data:image/png;base64,iVBORw0KGgo=';
        expect(sanitizeImageSrc(png)).toBe(png);
        expect(sanitizeImageSrc('data:image/svg+xml;base64,AAAA')).toBe('data:image/svg+xml;base64,AAAA');
    });

    it('blocks script-bearing and non-image data schemes', () => {
        expect(sanitizeImageSrc('javascript:alert(1)')).toBe('');
        expect(sanitizeImageSrc('vbscript:msgbox(1)')).toBe('');
        expect(sanitizeImageSrc('file:///etc/passwd')).toBe('');
        expect(sanitizeImageSrc('data:text/html,<script>alert(1)</script>')).toBe('');
        expect(sanitizeImageSrc('data:application/javascript,alert(1)')).toBe('');
    });

    it('blocks obfuscated schemes and handles empty / non-string input', () => {
        expect(sanitizeImageSrc('  javascript:alert(1)')).toBe('');
        expect(sanitizeImageSrc('java\tscript:alert(1)')).toBe('');
        expect(sanitizeImageSrc('')).toBe('');
        // @ts-expect-error exercising defensive runtime guard
        expect(sanitizeImageSrc(null)).toBe('');
    });
});
