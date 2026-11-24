const test = require('node:test');
const assert = require('node:assert/strict');
const { xmlEscape, toThumbnailFileName } = require('./sanitize');

test('xmlEscape neutralises the CDATA-breakout title XSS payload', () => {
    const payload = ']]></text><script>alert(document.domain)</script><text><![CDATA[x';
    const escaped = xmlEscape(payload);
    assert.ok(!/<script>/.test(escaped), 'must not contain a live <script> tag');
    assert.ok(!escaped.includes('</text>'), 'must not contain a live closing tag');
    assert.equal(
        escaped,
        ']]&gt;&lt;/text&gt;&lt;script&gt;alert(document.domain)&lt;/script&gt;&lt;text&gt;&lt;![CDATA[x'
    );
});

test('xmlEscape neutralises the raw-splice slug XSS payload', () => {
    const payload = 'RA9999</text><script>alert(document.domain)</script><text>';
    const escaped = xmlEscape(payload);
    assert.ok(!/<script>/.test(escaped));
    assert.ok(!escaped.includes('</text>'));
});

test('xmlEscape escapes ampersand first (no double-escaping)', () => {
    assert.equal(xmlEscape('a & <b> "c" \'d\''), 'a &amp; &lt;b&gt; &quot;c&quot; &apos;d&apos;');
    // An already-present entity must not be mangled into &amp;lt;
    assert.equal(xmlEscape('&lt;'), '&amp;lt;');
});

test('xmlEscape coerces non-strings and leaves safe text intact', () => {
    assert.equal(xmlEscape('Plain Title 123'), 'Plain Title 123');
    assert.equal(xmlEscape(42), '42');
});

test('toThumbnailFileName collapses forward and back slashes so no separator survives', () => {
    assert.equal(toThumbnailFileName('Foo/Bar'), 'foo-bar');
    assert.equal(toThumbnailFileName('Foo\\Bar'), 'foo-bar');
    // The Windows traversal payload cannot escape: backslashes become dashes,
    // so ".." is never a path segment.
    assert.equal(
        toThumbnailFileName('..\\..\\..\\windows\\system32'),
        '..-..-..-windows-system32'
    );
    assert.ok(!toThumbnailFileName('..\\..\\etc\\passwd').includes('\\'));
});

test('toThumbnailFileName strips colons and lowercases', () => {
    assert.equal(toThumbnailFileName('SAP: Data Cloud'), 'sap-data-cloud');
});

test('toThumbnailFileName exposes the collision between colon and space variants', () => {
    // Documents the normalization collision that generateArtifacts() now
    // detects and fails the build on.
    assert.equal(toThumbnailFileName('SAP Data Cloud'), toThumbnailFileName('SAP: Data Cloud'));
});
