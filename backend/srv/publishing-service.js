const cds = require('@sap/cds');
const { nanoid } = require('nanoid');
const { extractDrawioData, convertLexicalToMarkdown } = require('./lexicalToMarkdown');

const TARGET_REPO_OWNER = process.env.TARGET_REPO_OWNER;
const TARGET_REPO_NAME = process.env.TARGET_REPO_NAME;

async function githubApiRequest(endpoint, token, options = {}) {
    const GITHUB_API_URL = "https://api.github.com";
    const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
        ...options, headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'CAP-GitHub-Service' }
    });
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.message || `GitHub API error: ${response.status}`);
        error.status = response.status;
        throw error;
    }
    return data;
}

function generateFileTreeInMemory(doc, raFolderName) {
    const metadata = doc.metadata;
    const today = new Date().toISOString().split('T')[0];
    const frontMatter = `---
id: id-${raFolderName.toLowerCase()}
slug: /ref-arch/${nanoid(8)}
sidebar_position: 1
title: '${metadata.title.replace(/'/g, "''")} [${raFolderName.toUpperCase()}]'
description: '${(metadata.description || '').replace(/'/g, "''")}'
sidebar_label: '${metadata.title.replace(/'/g, "''")}'
tags:
${(metadata.tags || []).map(tag => `  - ${tag}`).join('\n')}
contributors:
${Array.from(new Set([...metadata.authors, ...(metadata.contributors || [])])).map(c => `  - ${c}`).join('\n')}
last_update:
  date: ${today}
  author: ${metadata.authors[0] || ''}
---
`;

    let filesToCommit = [];
    if (doc.editorState) {
        const jsonState = JSON.parse(doc.editorState);
        const drawioFiles = extractDrawioData(jsonState.root);
        filesToCommit.push(...drawioFiles);
        const markdownContent = convertLexicalToMarkdown(JSON.stringify(jsonState));
        filesToCommit.push({
            path: 'readme.md',
            content: frontMatter + '\n' + markdownContent
        });
    }
    return filesToCommit;
}

class PublishingService extends cds.ApplicationService {
    async init() {
        this.on('publish', async (req) => {
            console.log(req)
            const githubToken = req.user.githubAccessToken;
            if (!githubToken) return req.error(401, 'GitHub token is missing from JWT.');
            if (!TARGET_REPO_OWNER || !TARGET_REPO_NAME) return req.error(500, 'Target repository is not configured on the server.');

            try {
                const rootDocument = JSON.parse(req.data.document);

                const forkData = await githubApiRequest(`/repos/${TARGET_REPO_OWNER}/${TARGET_REPO_NAME}/forks`, githubToken, { method: 'POST' });
                const { owner: { login: repoOwner }, name: repoName } = forkData;

                const latestRaNumber = 0;
                const newRaNumber = latestRaNumber + 1;
                const newRaFolderName = `RA${newRaNumber.toString().padStart(4, '0')}`;
                
                let filesToCommit = generateFileTreeInMemory(rootDocument, newRaFolderName);
                filesToCommit.forEach(file => { file.path = `${newRaFolderName}/${file.path}` });
                
                const branch = 'main';
                const commitMessage = `feat: Add new RA document - ${rootDocument.metadata.title}`;

                const refData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/ref/heads/${branch}`, githubToken);
                const latestCommitSha = refData.object.sha;
                const commitData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/commits/${latestCommitSha}`, githubToken);
                const baseTreeSha = commitData.tree.sha;

                const blobPromises = filesToCommit.map(async (file) => {
                    const blobData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/blobs`, githubToken, {
                        method: 'POST', body: JSON.stringify({ content: file.content, encoding: 'utf-8' })
                    });
                    return { path: file.path, mode: '100644', type: 'blob', sha: blobData.sha };
                });
                const treeItems = await Promise.all(blobPromises);

                const newTreeData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/trees`, githubToken, {
                    method: 'POST', body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems })
                });
                const newCommitData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/commits`, githubToken, {
                    method: 'POST', body: JSON.stringify({ message: commitMessage, tree: newTreeData.sha, parents: [latestCommitSha] })
                });
                await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/refs/heads/${branch}`, githubToken, {
                    method: 'PATCH', body: JSON.stringify({ sha: newCommitData.sha })
                });

                return { message: `Successfully published to ${repoOwner}/${repoName}`, commitUrl: newCommitData.html_url };

            } catch (error) {
                console.error('Error during GitHub publish process:', error);
                return req.error(error.status || 500, error.message);
            }
        });
        await super.init();
    }
}

module.exports = PublishingService;