const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { dirname, join } = require('node:path');
const { resolveDocumentId, sanitizeId, ID_MAX_LENGTH } = require('./_drawio-asset-id');

function fixture(t) {
    const temporaryRoot = realpathSync(mkdtempSync(join(tmpdir(), 'drawio-asset-id-test-')));
    const root = join(temporaryRoot, 'repository');
    mkdirSync(root);
    t.after(() => rmSync(temporaryRoot, { recursive: true, force: true }));
    const write = (path, content) => {
        const absolutePath = join(root, path);
        mkdirSync(dirname(absolutePath), { recursive: true });
        writeFileSync(absolutePath, content);
        return absolutePath;
    };
    const diagram = (page = 'RA0001') => write('docs/ref-arch/' + page + '/drawio/architecture.drawio', '<mxfile/>');
    const readme = (content, page = 'RA0001') => write('docs/ref-arch/' + page + '/readme.md', content);
    return { temporaryRoot, root, write, diagram, readme };
}

test('keeps valid ID spelling, numeric leading zeroes, and the template ID', () => {
    for (const id of ['137800', '001234', 'id-ra0000', 'RA.one_two-3', 'x'.repeat(ID_MAX_LENGTH)]) {
        assert.equal(sanitizeId(id), id);
    }
    for (const id of [null, undefined, '']) assert.equal(sanitizeId(id), null);
});

test('rejects unsafe and overlength IDs instead of creating filename collisions', () => {
    for (const id of ['RA/one', 'RA\\one', '[hash]', 'evil?query', 'evil#fragment', 'a b', 'x\n', 'é', 'x'.repeat(ID_MAX_LENGTH + 1), 123, true, {}, []]) {
        assert.throws(() => sanitizeId(id), /filename-safe/);
    }
});

test('rejects "." and ".." which pass the allowlist but are not usable filename segments', () => {
    for (const id of ['.', '..']) assert.throws(() => sanitizeId(id), /must not be/);
});

for (const [value, expected] of [
    ['137800', '137800'],
    ['001234', '001234'],
    ['RA_one-3 # contribution note', 'RA_one-3'],
    ["'137800' # contribution note", '137800'],
    ['"RA0001" # contribution note', 'RA0001'],
    ['"RA\\u0031"', 'RA1'],
]) {
    test('resolves single-line YAML ID scalar ' + value, (t) => {
        const { diagram, readme } = fixture(t);
        const source = diagram();
        readme('---\nid: ' + value + '\ntitle: Architecture\n---\n');
        assert.equal(resolveDocumentId(source), expected);
    });
}

test('handles BOM, CRLF, quoted keys, and whitespace around YAML syntax', (t) => {
    const { diagram, readme } = fixture(t);
    const source = diagram();
    readme('\uFEFF--- \r\n"id"\t: "137800"\t# note\r\n---\r\nid: outside-block\r\n');
    assert.equal(resolveDocumentId(source), '137800');
});

for (const line of ['id:', 'id: # no ID', 'id: null', 'id: ~', 'id: ""', 'title: Architecture']) {
    test('an absent ID does not consume the following field: ' + line, (t) => {
        const { diagram, readme } = fixture(t);
        const source = diagram();
        readme('---\n' + line + '\nslug: /ref-arch/abcdef\n---\n');
        assert.equal(resolveDocumentId(source), null);
    });
}

for (const value of ['../../outside', '[hash]', 'true', '{name: RA0001}', '&alias RA0001', '*alias', '|', '"unterminated', "'unterminated", '"RA 1"', '"RA0001" trailing-text']) {
    test('rejects ambiguous or unsafe YAML ID value ' + value, (t) => {
        const { diagram, readme } = fixture(t);
        const source = diagram();
        readme('---\nid: ' + value + '\n---\n');
        assert.throws(() => resolveDocumentId(source), /Invalid Draw.io document id/);
    });
}

test('rejects duplicate ID fields and unterminated front matter with the readme path', (t) => {
    const { diagram, readme } = fixture(t);
    const source = diagram();
    const readmePath = readme('---\nid: one\n"id": two\n---\n');
    assert.throws(() => resolveDocumentId(source), (error) => error.message.includes(readmePath) && /duplicate/.test(error.message));
    readme('---\nid: one\n');
    assert.throws(() => resolveDocumentId(source), /unterminated front matter/);
});

test('the closest child readme governs, with a parent fallback only when the child readme is missing', (t) => {
    const { diagram, readme } = fixture(t);
    const source = diagram('RA0001/child');
    readme('---\nid: parent\n---\n');
    assert.equal(resolveDocumentId(source), 'parent');
    readme('---\nid: child\n---\n', 'RA0001/child');
    assert.equal(resolveDocumentId(source), 'child');
    readme('---\ntitle: Child without id\n---\n', 'RA0001/child');
    assert.equal(resolveDocumentId(source), null);
});

test('resolves deep page ancestry without an arbitrary depth limit', (t) => {
    const { diagram, readme } = fixture(t);
    const source = diagram('RA0001/' + Array(10).fill('nested').join('/'));
    readme('---\nid: parent\n---\n');
    assert.equal(resolveDocumentId(source), 'parent');
});

test('never inherits IDs from the primer or a readme outside docs/ref-arch', (t) => {
    const { root, write, diagram } = fixture(t);
    write('readme.md', '---\nid: repository\n---\n');
    write('docs/readme.md', '---\nid: docs\n---\n');
    write('docs/ref-arch/readme.md', '---\nid: primer\n---\n');
    assert.equal(resolveDocumentId(diagram()), null);
    assert.equal(resolveDocumentId(write('docs/ref-arch/drawio/primer.drawio', '<mxfile/>')), null);
    assert.equal(resolveDocumentId(write('other/drawio/a.drawio', '<mxfile/>')), null);
    const neighboring = write('docs/ref-arch-other/drawio/a.drawio', '<mxfile/>');
    assert.equal(resolveDocumentId(neighboring, { repositoryRoot: root }), null);
});

test('metadata edits, removals, and newly added child readmes are visible immediately', (t) => {
    const { diagram, readme } = fixture(t);
    const source = diagram('RA0001/child');
    const parent = readme('---\nid: first\n---\n');
    assert.equal(resolveDocumentId(source), 'first');
    readme('---\nid: second\n---\n');
    assert.equal(resolveDocumentId(source), 'second');
    const child = readme('---\nid: child\n---\n', 'RA0001/child');
    assert.equal(resolveDocumentId(source), 'child');
    rmSync(child);
    assert.equal(resolveDocumentId(source), 'second');
    rmSync(parent);
    assert.equal(resolveDocumentId(source), null);
});

test('reports existing and missing readmes as webpack dependencies', (t) => {
    const { root, diagram, readme } = fixture(t);
    const source = diagram('RA0001/child');
    const parent = readme('---\nid: parent\n---\n');
    const dependencies = [];
    assert.equal(resolveDocumentId(source, { repositoryRoot: root, onReadme: (...args) => dependencies.push(args) }), 'parent');
    assert.deepEqual(dependencies, [[join(root, 'docs/ref-arch/RA0001/child/readme.md'), false], [parent, true]]);
});

for (const kind of ['live', 'dangling', 'directory']) {
    test('rejects a ' + kind + ' readme symlink without reading its target', (t) => {
        const { temporaryRoot, root, diagram } = fixture(t);
        const source = diagram();
        const target = join(temporaryRoot, 'outside.md');
        if (kind === 'live') writeFileSync(target, '---\nid: external-secret\n---\n');
        if (kind === 'directory') mkdirSync(target);
        symlinkSync(target, join(root, 'docs/ref-arch/RA0001/readme.md'));
        assert.throws(() => resolveDocumentId(source), /regular, non-symlink file/);
        if (kind === 'live') assert.equal(readFileSync(target, 'utf8'), '---\nid: external-secret\n---\n');
    });
}

for (const ancestor of ['docs', 'docs/ref-arch', 'docs/ref-arch/RA0001', 'docs/ref-arch/RA0001/drawio']) {
    test('rejects a symlinked metadata ancestor: ' + ancestor, (t) => {
        const { root, diagram, readme } = fixture(t);
        const source = diagram();
        readme('---\nid: valid\n---\n');
        const ancestorPath = join(root, ancestor);
        const target = join(root, 'outside-metadata');
        mkdirSync(target);
        rmSync(ancestorPath, { recursive: true });
        symlinkSync(target, ancestorPath, 'dir');
        assert.throws(() => resolveDocumentId(source, { repositoryRoot: root }), /regular, non-symlink directory/);
    });
}
