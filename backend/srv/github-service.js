const cds = require('@sap/cds');
const path = require('path');
const fs = require('fs').promises;
const { glob } = require('glob');

const TARGET_REPO_OWNER = process.env.TARGET_REPO_OWNER;
const TARGET_REPO_NAME = process.env.TARGET_REPO_NAME;

async function githubApiRequest(endpoint, token, options = {}) {
    const GITHUB_API_URL = "https://api.github.com";
    const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'CAP-GitHub-Service',
        },
    });
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.message || `GitHub API error: ${response.status}`);
        error.status = response.status;
        throw error;
    }
    return data;
}

class GitHubService extends cds.ApplicationService {
    async init() {
        this.on('fork', async (req) => {
            const githubToken = req.user.githubAccessToken;
            if (!githubToken) return req.error(401, 'GitHub token is missing from JWT.');
            
            if (!TARGET_REPO_OWNER || !TARGET_REPO_NAME) {
                return req.error(500, 'Target repository is not configured on the server.');
            }

            try {
                const forkData = await githubApiRequest(`/repos/${TARGET_REPO_OWNER}/${TARGET_REPO_NAME}/forks`, githubToken, { method: 'POST' });
                return { forkedRepoOwner: forkData.owner.login, forkedRepoName: forkData.name };
            } catch (error) {
                return req.error(error.status || 500, error.message);
            }
        });

        this.on('commitDirectory', async (req) => {
            const { repoOwner, repoName, localDirectoryName, commitMessage } = req.data;
            const githubToken = req.user.githubAccessToken;
            if (!githubToken) return req.error(401, 'GitHub token is missing from JWT.');

            try {
                const localDirPath = path.resolve('..', 'docs/ref-arch', localDirectoryName);
                const branch = 'main';
                const refData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/ref/heads/${branch}`, githubToken);
                const latestCommitSha = refData.object.sha;
                const commitData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/commits/${latestCommitSha}`, githubToken);
                const baseTreeSha = commitData.tree.sha;
                const filePaths = await glob(`${localDirPath}/**/*`, { nodir: true });
                const blobPromises = filePaths.map(async (filePath) => {
                    const content = await fs.readFile(filePath, 'base64');
                    const blobData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/blobs`, githubToken, {
                        method: 'POST',
                        body: JSON.stringify({ content, encoding: 'base64' }),
                    });
                    return {
                        path: path.relative(localDirPath, filePath),
                        mode: '100644',
                        type: 'blob',
                        sha: blobData.sha,
                    };
                });
                const treeItems = await Promise.all(blobPromises);
                const newTreeData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/trees`, githubToken, {
                    method: 'POST',
                    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
                });
                const newCommitData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/commits`, githubToken, {
                    method: 'POST',
                    body: JSON.stringify({
                        message: commitMessage,
                        tree: newTreeData.sha,
                        parents: [latestCommitSha],
                    }),
                });
                await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/refs/heads/${branch}`, githubToken, {
                    method: 'PATCH',
                    body: JSON.stringify({ sha: newCommitData.sha }),
                });
                return { commitUrl: newCommitData.html_url };
            } catch (error) {
                return req.error(error.status || 500, error.message);
            }
        });

        await super.init();
    }
}

module.exports = GitHubService;