const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { delimiter, dirname, join, resolve } = require('node:path');

const sourceRoot = resolve(__dirname, '../..');
const hasZsh = spawnSync('zsh', ['--version']).status === 0;

function fixture(t) {
    const temporaryRoot = mkdtempSync(join(tmpdir(), 'cloudflare-deploy-offline-'));
    t.after(() => rmSync(temporaryRoot, { recursive: true, force: true }));
    // The checkout path itself is also untrusted shell text.
    const root = join(temporaryRoot, 'checkout spaces $() ; quotes');
    const script = join(root, 'src/_scripts/_deploy-cloudflare.zsh');
    const toolchain = join(root, '.github/workflows/wrangler');
    const commands = join(temporaryRoot, 'commands.jsonl');
    const bin = join(temporaryRoot, 'bin');
    mkdirSync(dirname(script), { recursive: true });
    mkdirSync(join(root, 'build'));
    mkdirSync(toolchain, { recursive: true });
    mkdirSync(bin);
    copyFileSync(join(__dirname, '_deploy-cloudflare.zsh'), script);
    for (const name of ['package.json', 'package-lock.json']) {
        copyFileSync(join(sourceRoot, '.github/workflows/wrangler', name), join(toolchain, name));
    }
    const fakeTool = '#!' + process.execPath + '\n' + String.raw`
const fs = require('node:fs');
const path = require('node:path');
const kind = path.basename(process.argv[1]);
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_COMMANDS, JSON.stringify({ kind, args }) + '\n');
if (kind === 'npm') {
    if (JSON.stringify(args) !== JSON.stringify(['ci', '--ignore-scripts', '--prefix', process.env.FAKE_TOOLCHAIN])) process.exit(99);
    if (process.env.FAKE_INSTALL_FAIL === '1') process.exit(23);
    const bin = path.join(process.env.FAKE_TOOLCHAIN, 'node_modules/.bin');
    fs.mkdirSync(bin, { recursive: true });
    fs.copyFileSync(process.argv[1], path.join(bin, 'wrangler'));
    fs.chmodSync(path.join(bin, 'wrangler'), 0o755);
} else if (kind === 'wrangler') {
    if (args[0] === '--version') console.log('4.151.3');
    if (args[0] === 'whoami' && process.env.FAKE_UNAUTHENTICATED === '1') process.exit(1);
    if (args[0] === 'pages') process.exit(Number(process.env.FAKE_DEPLOY_STATUS || 0));
} else {
    process.exit(99);
}
`;
    writeFileSync(join(bin, 'npm'), fakeTool, { mode: 0o755 });
    writeFileSync(join(bin, 'npx'), fakeTool, { mode: 0o755 });
    return {
        root, toolchain, temporaryRoot,
        run(args, extraEnv = {}) {
            const result = spawnSync('zsh', [script, ...args], {
                encoding: 'utf8',
                timeout: 10000,
                env: {
                    ...process.env,
                    PATH: bin + delimiter + process.env.PATH,
                    FAKE_COMMANDS: commands,
                    FAKE_TOOLCHAIN: toolchain,
                    ...extraEnv,
                },
            });
            assert.ifError(result.error);
            const calls = existsSync(commands)
                ? readFileSync(commands, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
                : [];
            return { ...result, calls };
        },
    };
}

test('deploy passes hostile project names literally to locked Wrangler without executing shell text', { skip: !hasZsh }, (t) => {
    const f = fixture(t);
    const sentinel = join(f.temporaryRoot, 'shell-injection');
    const project = 'project"; touch "' + sentinel + '"; # $(touch ' + sentinel + ')';
    const result = f.run(['--env', 'test', '--project', project]);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(existsSync(sentinel), false);
    assert.deepEqual(result.calls, [
        { kind: 'npm', args: ['ci', '--ignore-scripts', '--prefix', f.toolchain] },
        { kind: 'wrangler', args: ['--version'] },
        { kind: 'wrangler', args: ['whoami'] },
        { kind: 'wrangler', args: ['pages', 'deploy', join(f.root, 'build'), '--project-name=' + project, '--branch=test'] },
    ]);
});

for (const args of [['--env'], ['--env', 'invalid'], ['--env', 'DEV', '--project'], ['--unknown']]) {
    test('invalid deployment arguments perform no install, authentication, or deployment: ' + args.join(' '), { skip: !hasZsh }, (t) => {
        const f = fixture(t);
        const result = f.run(args);
        assert.notEqual(result.status, 0);
        assert.deepEqual(result.calls, []);
    });
}

test('deploy help performs no install, authentication, or deployment', { skip: !hasZsh }, (t) => {
    const result = fixture(t).run(['--help']);
    assert.equal(result.status, 0);
    assert.deepEqual(result.calls, []);
});

test('a locked installation failure prevents authentication and deployment', { skip: !hasZsh }, (t) => {
    const result = fixture(t).run(['--env', 'PROD'], { FAKE_INSTALL_FAIL: '1' });
    assert.equal(result.status, 23);
    assert.deepEqual(result.calls.map((call) => call.kind), ['npm']);
});

test('deploy propagates Wrangler failure and targets the configured production branch', { skip: !hasZsh }, (t) => {
    const result = fixture(t).run(['--env', 'PROD'], { FAKE_DEPLOY_STATUS: '17' });
    assert.equal(result.status, 17);
    assert.equal(result.calls.at(-1).args.at(-1), '--branch=prod');
});

test('production workflow jobs reject manual dispatches from other branches', () => {
    const workflow = readFileSync(join(sourceRoot, '.github/workflows/deploy-to-cloudflare.yml'), 'utf8');
    const lines = workflow.split('\n');
    for (const job of ['build', 'deploy']) {
        const start = lines.indexOf('  ' + job + ':');
        assert.notEqual(start, -1, 'Missing production job: ' + job);
        const rest = lines.slice(start + 1);
        const nextJob = rest.findIndex((line) => /^  [a-z]+:$/.test(line));
        const section = nextJob === -1 ? rest : rest.slice(0, nextJob);
        assert.equal(section.filter((line) => line === "    if: github.ref == 'refs/heads/main'").length, 1);
    }
});
