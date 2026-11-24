const { xmlEscape } = require('./sanitize');

// Keep SVG assembly separate from exporting so escaping can be checked on the
// final document, including JavaScript's replacement-string handling.
function watermarkSvg(svg, { title, lastUpdated, smallSlug, logoSvg, qrSvgContent, backgroundColor }) {
    const viewBoxMatch = svg.match(/viewBox="([^"]*)"/);
    if (!viewBoxMatch) throw new Error('Exported SVG is missing a viewBox.');
    const viewBox = viewBoxMatch[1].split(' ');
    const height = parseInt(viewBox[3]);
    const width = parseInt(viewBox[2]);
    let scaleBox = width / 1500;
    scaleBox = Math.max(1, scaleBox);
    const pad = 20 * scaleBox;
    viewBox[0] = -pad;
    viewBox[1] = -pad;
    viewBox[2] = width + pad * 2;
    const logo = { h: 57, w: 116, mt: 36 };
    let scaleDown = width / 1500;
    scaleDown = Math.max(0.7, scaleDown);
    logo.h = logo.h * scaleDown;
    logo.w = logo.w * scaleDown;
    const yShift = 56 * scaleBox;
    viewBox[3] = height + pad * 2 + logo.mt + logo.h + yShift;
    logo.y = viewBox[3] - pad * 2 - logo.h - yShift;
    const textX = logo.w + pad;
    const qrSize = 33 * 2.4 * scaleDown;

    const mark = `<text id="drawio-title" x="0" y="${pad}" font-family="Arial" font-weight="bold" font-size="${Math.round(27 * scaleDown)}">
                            ${xmlEscape(title)}
                        </text>
                        <g transform="translate(0, ${yShift})">
                        <text x="${textX}" y="${(logo.y + Math.round(logo.h * 0.5))}" font-family="Arial" font-weight="bold"
                                font-size="${Math.round(22 * scaleDown)}">
                            Architecture Center
                        </text>
                        <text x="${textX}" y="${logo.y + Math.round(logo.h * 0.9)}" font-family="Arial" font-style="italic"
                                font-size="${Math.round(17 * scaleDown)}">
                            Last update on ${xmlEscape(lastUpdated)}
                        </text>
                        <g transform="translate(0, ${logo.y})">
                            <image width="${logo.w}" height="${logo.h}" href="data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}" />
                        </g>
                        <text x="${width / 2 - pad}" y="${logo.y + Math.round(logo.h * 0.75)}" font-family="Arial"
                                font-size="${Math.round(20 * scaleDown)}">
                            ${xmlEscape(smallSlug)}
                        </text>
                        </g>
                        <g transform="translate(${width - qrSize}, ${viewBox[3] - pad * 2 - qrSize}) scale(${2.4 * scaleDown})">
                            ${qrSvgContent}
                        </g>`;

    const bg = `<rect x="${-pad}" y="${-pad}" width="${viewBox[2]}" height="${viewBox[3]}" fill="${backgroundColor}"/>`;
    return svg
        .replace(/<svg([^>]*)>/, '<svg$1>' + bg)
        .replace('<g>', `<g transform="translate(0, ${yShift})">`)
        // A callback inserts escaped metadata literally: $&, $', $` and $$
        // must never be interpreted as replacement-string instructions.
        .replace(/<\/svg>$/, () => mark + '</svg>')
        .replace(/viewBox="([^"]*)"/, `viewBox="${viewBox.join(' ')}"`)
        .replace(/height="([^"]*)"/, `height="${viewBox[3]}"`)
        .replace(/width="([^"]*)"/, `width="${viewBox[2]}"`);
}

module.exports = { watermarkSvg };
