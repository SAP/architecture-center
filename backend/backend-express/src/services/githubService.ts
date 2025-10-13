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
    const data = await response.json();
    if (!response.ok) {
        console.error(`[GitHub API Error] <= Endpoint ${endpoint} failed with status ${response.status}`);
        const error: GitHubApiError = new Error(data.message || `GitHub API error: ${response.status}`);
        error.status = response.status;
        throw error;
    }
    return data;
}

async function getOrCreateFork(targetRepoOwner: string, targetRepoName: string, token: string): Promise<any> {
    try {
        const userInfo = await githubApiRequest('/user', token);
        const username = userInfo.login;

        console.log(`[GitHub Flow] => Checking if fork exists for user: ${username}`);
        try {
            const existingFork = await githubApiRequest(`/repos/${username}/${targetRepoName}`, token);
            console.log(`[GitHub Flow] => Fork already exists, using existing fork: ${existingFork.full_name}`);
            return existingFork;
        } catch (error: any) {
            if (error.status === 404) {
                console.log(`[GitHub Flow] => Fork does not exist, creating new fork...`);
                const forkData = await githubApiRequest(`/repos/${targetRepoOwner}/${targetRepoName}/forks`, token, {
                    method: 'POST',
                });
                console.log(`[GitHub Flow] => Fork created successfully: ${forkData.full_name}`);
                return forkData;
            } else {
                throw error;
            }
        }
    } catch (error: any) {
        console.error(`[GitHub Flow] => Error in fork creation/retrieval: ${error.message}`);
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
    try {
        console.log(`[GitHub Flow] => Creating pull request from ${forkOwner}:${branchName} to ${targetOwner}:${TARGET_BRANCH}`);
        
        const prData = await githubApiRequest(`/repos/${targetOwner}/${targetRepo}/pulls`, token, {
            method: 'POST',
            body: JSON.stringify({
                title,
                head: `${forkOwner}:${branchName}`,
                base: TARGET_BRANCH,
                body,
                maintainer_can_modify: true
            }),
        });
        
        console.log(`[GitHub Flow] => Pull request created successfully: ${prData.html_url}`);
        return prData.html_url;
    } catch (error: any) {
        console.error(`[GitHub Flow] => Error creating pull request: ${error.message}`);
        throw error;
    }
}

export async function publishToGitHub(rootDocument: DocumentObject, token: string, createPR: boolean = false): Promise<PublishResult> {
    if (!TARGET_REPO_OWNER || !TARGET_REPO_NAME) {
        const error: GitHubApiError = new Error('Target repository is not configured on the server.');
        error.status = 500;
        throw error;
    }

    const forkData = await getOrCreateFork(TARGET_REPO_OWNER, TARGET_REPO_NAME, token);
    const {
        owner: { login: repoOwner },
        name: repoName,
    } = forkData;

    const upstreamBranchRef = await githubApiRequest(
        `/repos/${TARGET_REPO_OWNER}/${TARGET_REPO_NAME}/git/ref/heads/${TARGET_BRANCH}`,
        token
    );
    const latestUpstreamSha = upstreamBranchRef.object.sha;
    console.log(
        `[GitHub Flow] => Latest commit on upstream '${TARGET_BRANCH}' is ${latestUpstreamSha.substring(0, 7)}`
    );

    try {
        console.log(`[GitHub Flow] => Syncing fork's '${TARGET_BRANCH}' branch...`);
        await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/refs/heads/${TARGET_BRANCH}`, token, {
            method: 'PATCH',
            body: JSON.stringify({ sha: latestUpstreamSha, force: true }),
        });
        console.log(`[GitHub Flow] => Fork's '${TARGET_BRANCH}' branch successfully synced.`);
    } catch (error: any) {
        if (error.status === 404 || error.status === 422) {
            console.log(`[GitHub Flow] => Branch '${TARGET_BRANCH}' not found in fork. Creating it...`);
            await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/refs`, token, {
                method: 'POST',
                body: JSON.stringify({ ref: `refs/heads/${TARGET_BRANCH}`, sha: latestUpstreamSha }),
            });
            console.log(`[GitHub Flow] => Branch '${TARGET_BRANCH}' created successfully in the fork.`);
        } else {
            throw error;
        }
    }

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
            if (raNumbers.length > 0) {
                latestRaNumber = Math.max(...raNumbers);
            }
        }
    } catch (error: any) {
        if (error.status === 404) {
            console.log(`[GitHub Flow] => Directory '${REPO_BASE_PATH}' not found in fork. Starting from RA0001.`);
            latestRaNumber = 0;
        } else {
            throw error;
        }
    }

    const newRaNumber = latestRaNumber + 1;
    const newRaFolderName = `RA${newRaNumber.toString().padStart(4, '0')}`;
    
    // Create branch name from RA number and document title
    const titleSlug = rootDocument.metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    const branchName = `${newRaFolderName}-${titleSlug}`;
    console.log(`[GitHub Flow] => Calculated next directory name: ${newRaFolderName}`);
    console.log(`[GitHub Flow] => Branch name for this publish: ${branchName}`);

    const filesToCommit = generateFileTreeInMemory(rootDocument, newRaFolderName);

    // Create a new branch for this feature
    console.log(`[GitHub Flow] => Creating new branch: ${branchName}`);
    await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/refs`, token, {
        method: 'POST',
        body: JSON.stringify({ 
            ref: `refs/heads/${branchName}`, 
            sha: latestUpstreamSha 
        }),
    });

    const commitMessage = `feat: Add new RA document - ${rootDocument.metadata.title}`;
    const refData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/ref/heads/${branchName}`, token);
    const latestCommitSha = refData.object.sha;
    const commitData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/commits/${latestCommitSha}`, token);
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
        body: JSON.stringify({ message: commitMessage, tree: newTreeData.sha, parents: [latestCommitSha] }),
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

    return {
        commitUrl: newCommitData.html_url,
        repoFullName: `${repoOwner}/${repoName}`,
        pullRequestUrl,
        branchName,
    };
}
