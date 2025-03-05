const { readdirSync, readFileSync, writeFileSync } = require('node:fs');
const { normalize: normalizePath } = require('path');

const GITHUB_API = 'https://api.github.com';
// assuming script is in src/_scripts/
const docs = normalizePath(__dirname + '/../../docs');
const OUT = docs + '/contributors.json';
const SEARCH_DIR = docs + '/ref-arch/';
const log = console.log;

const readmes = readdirSync(SEARCH_DIR, { recursive: true })
    .filter((file) => file.match(/readme\.md$/))
    .map((p) => SEARCH_DIR + p);

const usernames = new Set();
for (const rme of readmes) {
    const content = readFileSync(rme, 'utf8');
    const frontmatter = content.split('---')[1];
    const match = frontmatter.match(/^contributors:\s*\n(  - .+\n|  \s*\n)+/m);
    if (match) {
        for (const name of match[0].match(/^  - (.+)$/gm)) {
            usernames.add(name.replace(/^  - /, ''));
        }
    }
}

log(`There are ${usernames.size} unique contributors\nFetching contributors details now...`);

const contributorsDetails = {};
const todo = [...usernames].slice(0, 1);
(async () => {
    for (const name of todo) {
        const resp = await fetch(
            `${GITHUB_API}/users/${todo[0]}`, // Note: 'todos' was likely a typo in original Python, using 'todo' here
            {
                headers: {
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            }
        );
        // log remaining api quota after the last request
        const hds = ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Used'].map((hd) => hd.toLowerCase());
        if (resp.ok) {
            const data = await resp.json();
            contributorsDetails[name] = {
                avatarUrl: data.avatar_url,
                profileUrl: data.html_url,
                fullName: data.name,
            };

            isLast = name === todo.slice(-1)[0];
            if (isLast) {
                log('API Quota after last request:');
                resp.headers
                    .entries()
                    .filter(([hd, v]) => hds.includes(hd.toLowerCase()))
                    .forEach(([hd, v]) => log(hd + ': ' + v));
            }
        }
    }

    writeFileSync(OUT, JSON.stringify(contributorsDetails, null, 4));
})();
