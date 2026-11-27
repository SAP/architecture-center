const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { delimiter, dirname, join, resolve } = require('node:path');

const sourceRoot = resolve(__dirname, '../..');
const hasZsh = spawnSync('zsh', ['--version']).status === 0;

function productionDeployCommand() {
    const lines = readFileSync(join(sourceRoot, '.github/workflows/deploy-to-cloudflare.yml'), 'utf8').split('\n');
    const step = lines.indexOf('      - name: Deploy to Cloudflare (Pages)');
    assert.notEqual(step, -1, 'Missing production deployment step');
    const start = lines.indexOf('        run: |', step);
    assert.ok(start > step, 'Production deployment must have a command block');
    const command = [];
    for (const line of lines.slice(start + 1)) {
        if (line.trim() && !line.startsWith('          ')) break;
        command.push(line.slice(10));
    }
    return command.join('\n');
}

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
    if (args[0] === '--version') {
        const packageJson = JSON.parse(fs.readFileSync(path.join(process.env.FAKE_TOOLCHAIN, 'package.json'), 'utf8'));
        console.log(packageJson.dependencies.wrangler);
    }
    if (args[0] === 'whoami' && process.env.FAKE_UNAUTHENTICATED === '1') {
        if (args.includes('--json')) {
            console.log(JSON.stringify({ loggedIn: false }));
            process.exit(1);
        }
        console.log('You are not authenticated. Please run wrangler login.');
    }
    if (args[0] === 'login') process.exit(Number(process.env.FAKE_LOGIN_STATUS || 0));
    if (args[0] === 'pages') process.exit(Number(process.env.FAKE_DEPLOY_STATUS || 0));
} else {
    process.exit(99);
}
`;
    writeFileSync(join(bin, 'npm'), fakeTool, { mode: 0o755 });
    writeFileSync(join(bin, 'npx'), fakeTool, { mode: 0o755 });
    writeFileSync(join(bin, 'wrangler'), fakeTool, { mode: 0o755 });
    function calls() {
        return existsSync(commands)
            ? readFileSync(commands, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
            : [];
    }
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
            return { ...result, calls: calls() };
        },
        runProductionWorkflow(label) {
            const env = { ...process.env, PATH: bin + delimiter + process.env.PATH, FAKE_COMMANDS: commands };
            if (label === undefined) delete env.CLOUDFLARE_PRODUCTION_ENVIRONMENT_LABEL;
            else env.CLOUDFLARE_PRODUCTION_ENVIRONMENT_LABEL = label;
            const result = spawnSync('bash', ['--noprofile', '--norc', '-eo', 'pipefail', '-c', productionDeployCommand()], {
                cwd: root, env, encoding: 'utf8', timeout: 10000,
            });
            assert.ifError(result.error);
            return { ...result, calls: calls() };
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
        { kind: 'wrangler', args: ['whoami', '--json'] },
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

test('an unauthenticated identity triggers login before local deployment', { skip: !hasZsh }, (t) => {
    const result = fixture(t).run(['--env', 'TEST'], { FAKE_UNAUTHENTICATED: '1' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.ok(!result.stdout.includes('Already authenticated'));
    assert.deepEqual(result.calls.slice(2).map((call) => call.args[0]), ['whoami', 'login', 'pages']);
    assert.deepEqual(result.calls[2].args, ['whoami', '--json']);
});

test('a failed login prevents deployment and propagates the authentication failure', { skip: !hasZsh }, (t) => {
    const result = fixture(t).run(['--env', 'TEST'], { FAKE_UNAUTHENTICATED: '1', FAKE_LOGIN_STATUS: '19' });
    assert.equal(result.status, 19);
    assert.equal(result.calls.at(-1).args[0], 'login');
    assert.ok(!result.calls.some((call) => call.args[0] === 'pages'));
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

for (const label of [undefined, '', ' ', '\t\n']) {
    test('production workflow refuses an absent or blank branch label: ' + JSON.stringify(label), (t) => {
        const result = fixture(t).runProductionWorkflow(label);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /CLOUDFLARE_PRODUCTION_ENVIRONMENT_LABEL must be configured and nonempty/);
        assert.deepEqual(result.calls, []);
    });
}

test('production workflow passes the configured branch label to Pages literally', (t) => {
    const f = fixture(t);
    const result = f.runProductionWorkflow('prod');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.deepEqual(result.calls, [{ kind: 'wrangler', args: [
        'pages', 'deploy', './build', '--project-name', 'sap-architecture-center', '--branch', 'prod',
    ] }]);
});

test('production workflow does not execute shell text inside the branch label', (t) => {
    const f = fixture(t);
    const sentinel = join(f.temporaryRoot, 'branch-shell-injection');
    const label = 'prod"; touch "' + sentinel + '"; # $(touch ' + sentinel + ')';
    const result = f.runProductionWorkflow(label);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(existsSync(sentinel), false);
    assert.equal(result.calls.at(-1).args.at(-1), label);
});
