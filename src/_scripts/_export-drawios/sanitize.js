// Pure sanitizers for untrusted readme front-matter (title, slug) that gets
// spliced into the served watermarked SVGs and used to build thumbnail
// filenames. Kept in a standalone module so they can be unit-tested: the
// _export.js entrypoint runs side effects on load (probes the drawio CLI,
// calls main()) and cannot be imported directly.

// Escape a value for safe inclusion as SVG/XML text content or attribute value.
// The watermark is built by string concatenation, so unescaped `<`/`>`/`&`/
// quotes in untrusted front-matter would allow SVG/script injection (stored
// XSS) in the publicly served SVGs. `&` must be replaced first. Trusted
// machine-generated markup (e.g. the QR code the qrcode library emits) must NOT
// be passed through this.
function xmlEscape(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

// Derive a safe single-segment thumbnail filename stem from an (untrusted) RA
// title. Collapses whitespace AND both path separators ("/" and Windows "\")
// so no separator survives — which also makes any ".." inert and keeps the
// result a single path segment on every platform.
function toThumbnailFileName(title) {
    return String(title)
        .toLowerCase()
        .replace(/[\s/\\]+/g, '-')
        .replace(/:/g, '');
}

module.exports = { xmlEscape, toThumbnailFileName };
