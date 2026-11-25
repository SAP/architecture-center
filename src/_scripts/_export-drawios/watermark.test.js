const test = require('node:test');
const assert = require('node:assert/strict');
const { watermarkSvg } = require('./watermark');

const originalContents = '<rect id="original-shape" width="10" height="10"/>'
    + '<text id="original-text">Original &amp; text</text>';
const originalSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1000" viewBox="0 0 1500 1000">'
    + '<g>' + originalContents + '</g></svg>';
const options = {
    title: 'Architecture title',
    lastUpdated: 'November 24, 2026',
    smallSlug: 'RA9999',
    logoSvg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
    qrSvgContent: '<path id="qr-code" d="M0 0h1v1z"/>',
    backgroundColor: '#ffffff',
};

function watermarkText(svg) {
    return [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)]
        .slice(1)
        .map((match) => match[1].trim());
}

function assertOriginalDocumentPreserved(svg) {
    assert.equal((svg.match(/<svg(?:\s|>)/g) || []).length, 1);
    assert.equal((svg.match(/<\/svg>/g) || []).length, 1);
    assert.equal((svg.match(/id="original-shape"/g) || []).length, 1);
    assert.ok(svg.includes(originalContents));
    assert.ok(svg.includes(options.qrSvgContent));
    assert.ok(svg.endsWith('</svg>'));
}

test('assembles a watermark while preserving the diagram and its existing layout', () => {
    const svg = watermarkSvg(originalSvg, options);
    assertOriginalDocumentPreserved(svg);
    assert.match(svg, /^<svg[^>]*width="1540" height="1189" viewBox="-20 -20 1540 1189">/);
    assert.ok(svg.includes('<g transform="translate(0, 56)">' + originalContents));
    assert.deepEqual(watermarkText(svg), [
        'Architecture title',
        'Architecture Center',
        'Last update on November 24, 2026',
        'RA9999',
    ]);
});

for (const [value, escaped] of [
    ['Price $&', 'Price $&amp;'],
    ['Price $<', 'Price $&lt;'],
    ["Price $'", 'Price $&apos;'],
    ['Price $`', 'Price $`'],
    ['Price $$', 'Price $$'],
]) {
    test('preserves replacement tokens literally in assembled watermark text: ' + value, () => {
        const svg = watermarkSvg(originalSvg, {
            ...options,
            title: value,
            lastUpdated: value,
            smallSlug: value,
        });
        assertOriginalDocumentPreserved(svg);
        assert.deepEqual(watermarkText(svg), [
            escaped,
            'Architecture Center',
            'Last update on ' + escaped,
            escaped,
        ]);
    });
}

test('keeps CDATA and script breakout payloads as text in the assembled SVG', () => {
    const svg = watermarkSvg(originalSvg, {
        ...options,
        title: ']]></text><script>alert(1)</script><text><![CDATA[x',
        lastUpdated: '"</text><script>alert(2)</script><text>',
        smallSlug: 'RA9999</text><script>alert(3)</script><text>',
    });
    assertOriginalDocumentPreserved(svg);
    assert.ok(!svg.includes('<script'));
    assert.ok(!svg.includes('<![CDATA['));
    assert.deepEqual(watermarkText(svg), [
        ']]&gt;&lt;/text&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;text&gt;&lt;![CDATA[x',
        'Architecture Center',
        'Last update on &quot;&lt;/text&gt;&lt;script&gt;alert(2)&lt;/script&gt;&lt;text&gt;',
        'RA9999&lt;/text&gt;&lt;script&gt;alert(3)&lt;/script&gt;&lt;text&gt;',
    ]);
});

test('rejects an exported SVG without a viewBox', () => {
    assert.throws(() => watermarkSvg('<svg></svg>', options), /missing a viewBox/);
});
