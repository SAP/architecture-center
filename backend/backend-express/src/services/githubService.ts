import { FileForCommit, DocumentObject, generateFileTreeInMemory } from './lexicalService';
import { generatePRBody } from '../templates/prTemplate';

const { TARGET_REPO_OWNER, TARGET_REPO_NAME } = process.env;

const TARGET_BRANCH = 'dev';
const REPO_BASE_PATH = 'docs/ref-arch';

interface GitHubApiError extends Error {
    status?: number;
}
interface GitHubBlob {
    path: string;
    mode: '100644';
    type: 'blob';
    sha: string;
}
interface PublishResult {
    commitUrl: string;
    repoFullName: string;
    pullRequestUrl?: string;
    branchName: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function githubApiRequest(endpoint: string, token: string, options: RequestInit = {}): Promise<any> {
    const GITHUB_API_URL = 'https://api.github.com';
    console.log(`[GitHub API Request] => Calling endpoint: ${endpoint}`);
    const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'AC-Publishing-Service',
        },
    });
    if (response.status === 204) return;
    const data = await response.json();
    if (!response.ok) {
        console.error(`[GitHub API Error] <= Endpoint ${endpoint} failed with status ${response.status}`);
        const error: GitHubApiError = new Error(data.message || `GitHub API error: ${response.status}`);
        error.status = response.status;
        throw error;
    }
    return data;
}

export async function syncUserFork(token: string): Promise<{ success: boolean; message: string }> {
    if (!TARGET_REPO_OWNER || !TARGET_REPO_NAME) throw new Error('Target repository is not configured.');

    const userInfo = await githubApiRequest('/user', token);
    const repoOwner = userInfo.login;
    const repoName = TARGET_REPO_NAME;

    try {
        console.log(
            `[GitHub Flow] => Syncing fork ${repoOwner}/${repoName} with upstream branch '${TARGET_BRANCH}'...`
        );
        await githubApiRequest(`/repos/${repoOwner}/${repoName}/merge-upstream`, token, {
            method: 'POST',
            body: JSON.stringify({ branch: TARGET_BRANCH }),
        });
        console.log(`[GitHub Flow] => Fork successfully synced.`);
        return { success: true, message: 'Fork synced successfully.' };
    } catch (error: any) {
        if (error.status === 409 || error.status === 422) {
            console.error(`[GitHub Flow] => Sync conflict detected. Aborting. User action required.`);
            const conflictError: GitHubApiError = new Error(
                'SYNC_CONFLICT: Your forked repository is out of sync and could not be updated automatically. Please sync it manually on GitHub.'
            );
            conflictError.status = 409;
            throw conflictError;
        }
        console.error(`[GitHub Flow] => Failed to sync fork. Error: ${error.message}`);
        throw new Error('Could not sync the forked repository with the upstream.');
    }
}

async function getOrCreateFork(targetRepoOwner: string, targetRepoName: string, token: string): Promise<any> {
    const userInfo = await githubApiRequest('/user', token);
    const username = userInfo.login;
    try {
        return await githubApiRequest(`/repos/${username}/${targetRepoName}`, token);
    } catch (error: any) {
        if (error.status === 404) {
            return await githubApiRequest(`/repos/${targetRepoOwner}/${targetRepoName}/forks`, token, {
                method: 'POST',
            });
        }
        throw error;
    }
}

async function createPullRequest(
    forkOwner: string,
    forkRepo: string,
    targetOwner: string,
    targetRepo: string,
    branchName: string,
    title: string,
    body: string,
    token: string
): Promise<string> {
    const prData = await githubApiRequest(`/repos/${targetOwner}/${targetRepo}/pulls`, token, {
        method: 'POST',
        body: JSON.stringify({
            title,
            head: `${forkOwner}:${branchName}`,
            base: TARGET_BRANCH,
            body,
            maintainer_can_modify: true,
        }),
    });
    return prData.html_url;
}

export async function publishToGitHub(
    rootDocument: DocumentObject,
    token: string,
    createPR: boolean = false
): Promise<PublishResult> {
    if (!TARGET_REPO_OWNER || !TARGET_REPO_NAME) {
        const error: GitHubApiError = new Error('Target repository is not configured on the server.');
        error.status = 500;
        throw error;
    }

    await getOrCreateFork(TARGET_REPO_OWNER, TARGET_REPO_NAME, token);
    await syncUserFork(token);

    const userInfo = await githubApiRequest('/user', token);
    const repoOwner = userInfo.login;
    const repoName = TARGET_REPO_NAME;

    const syncedBranchRef = await githubApiRequest(
        `/repos/${repoOwner}/${repoName}/git/ref/heads/${TARGET_BRANCH}`,
        token
    );
    const latestCommitSha = syncedBranchRef.object.sha;

    let latestRaNumber = 0;
    try {
        const contents = await githubApiRequest(
            `/repos/${repoOwner}/${repoName}/contents/${REPO_BASE_PATH}?ref=${TARGET_BRANCH}`,
            token
        );
        if (Array.isArray(contents)) {
            const raNumbers = contents
                .filter((item) => item.type === 'dir' && item.name.startsWith('RA'))
                .map((item) => parseInt(item.name.substring(2), 10))
                .filter((num) => !isNaN(num));
            if (raNumbers.length > 0) latestRaNumber = Math.max(...raNumbers);
        }
    } catch (error: any) {
        if (error.status !== 404) throw error;
    }

    const newRaNumber = latestRaNumber + 1;
    const newRaFolderName = `RA${newRaNumber.toString().padStart(4, '0')}`;
    const titleSlug = rootDocument.metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    const branchName = `${newRaFolderName}-${titleSlug}`;
    const filesToCommit = generateFileTreeInMemory(rootDocument, newRaFolderName);

    await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/refs`, token, {
        method: 'POST',
        body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: latestCommitSha }),
    });

    const commitMessage = `feat: Add new RA document - ${rootDocument.metadata.title}`;
    const refData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/ref/heads/${branchName}`, token);
    const latestBranchCommitSha = refData.object.sha;
    const commitData = await githubApiRequest(
        `/repos/${repoOwner}/${repoName}/git/commits/${latestBranchCommitSha}`,
        token
    );
    const baseTreeSha = commitData.tree.sha;

    const blobPromises = filesToCommit.map(async (file) => {
        const content =
            file.encoding === 'base64' ? file.content : Buffer.from(file.content, 'utf-8').toString('base64');
        const blobData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/blobs`, token, {
            method: 'POST',
            body: JSON.stringify({ content, encoding: 'base64' }),
        });
        return {
            path: `${REPO_BASE_PATH}/${newRaFolderName}/${file.path}`,
            mode: '100644' as const,
            type: 'blob' as const,
            sha: blobData.sha,
        };
    });
    const treeItems: GitHubBlob[] = await Promise.all(blobPromises);

    const newTreeData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/trees`, token, {
        method: 'POST',
        body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
    });
    const newCommitData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/commits`, token, {
        method: 'POST',
        body: JSON.stringify({ message: commitMessage, tree: newTreeData.sha, parents: [latestBranchCommitSha] }),
    });
    await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/refs/heads/${branchName}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ sha: newCommitData.sha }),
    });

    let pullRequestUrl;
    if (createPR) {
        const prTitle = `[CONTENT] ${newRaFolderName}- ${rootDocument.metadata.title}`;
        const prBody = generatePRBody(newRaFolderName, rootDocument.metadata.title);
        pullRequestUrl = await createPullRequest(
            repoOwner,
            repoName,
            TARGET_REPO_OWNER!,
            TARGET_REPO_NAME!,
            branchName,
            prTitle,
            prBody,
            token
        );
    }

    return { commitUrl: newCommitData.html_url, repoFullName: `${repoOwner}/${repoName}`, pullRequestUrl, branchName };
}
