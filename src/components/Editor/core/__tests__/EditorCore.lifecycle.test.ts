import { execFileSync } from 'node:child_process';
import path from 'node:path';

describe('EditorCore lifecycle', () => {
    it('ignores delayed commands after destruction without changing or syncing another identity', () => {
        // Exercise the real editor at runtime in a separate process. Transpiling
        // its source in memory keeps this lifecycle test independent of existing
        // editor type errors without changing Jest's TypeScript diagnostics.
        const script = String.raw`
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => {
    const source = fs.readFileSync(file, 'utf8');
    const result = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    });
    module._compile(result.outputText, file);
};
const { JSDOM } = require(require.resolve('jsdom', { paths: [require.resolve('jest-environment-jsdom')] }));
const dom = new JSDOM('<!doctype html><body><div id="editor"></div>');
Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    Node: dom.window.Node,
    HTMLElement: dom.window.HTMLElement,
    NodeFilter: dom.window.NodeFilter,
});
const { EditorCore } = require('./src/components/Editor/core/EditorCore.ts');
const { serializeState } = require('./src/components/Editor/core/EditorState.ts');
let activeDocument = 'alice-document';
const changes = [], synced = [];
const core = new EditorCore({
    onChange: state => changes.push({ activeDocument, state }),
    onSyncOperations: operations => synced.push({ activeDocument, operations }),
    syncDebounceMs: 10,
});
core.mount(document.getElementById('editor'));
core.dispatchCommand({ type: 'INSERT_TEXT', payload: { text: 'Alice draft' } });
const savedState = serializeState(core.getState());
changes.length = 0;
core.destroy();
activeDocument = 'bob-document';
// File reads and asset uploads can settle after Quick Start has changed users.
core.dispatchCommand({ type: 'INSERT_TEXT', payload: { text: 'Late Alice upload' } });
setTimeout(() => {
    assert.equal(serializeState(core.getState()), savedState);
    assert.equal(core.getContainer(), null);
    assert.deepEqual(changes, []);
    assert.deepEqual(synced, []);
    core.destroy();
    dom.window.close();
}, 25);
`;
        execFileSync(process.execPath, [], {
            cwd: path.resolve(__dirname, '../../../../..'),
            input: script,
            timeout: 5000,
            stdio: ['pipe', 'pipe', 'pipe'],
        });
    });
});
