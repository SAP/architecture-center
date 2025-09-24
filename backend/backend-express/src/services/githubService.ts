import { FileForCommit, DocumentObject, generateFileTreeInMemory } from './lexicalService';

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

export async function publishToGitHub(rootDocument: DocumentObject, token: string): Promise<PublishResult> {
    if (!TARGET_REPO_OWNER || !TARGET_REPO_NAME) {
        const error: GitHubApiError = new Error('Target repository is not configured on the server.');
        error.status = 500;
        throw error;
    }

    const forkData = await githubApiRequest(`/repos/${TARGET_REPO_OWNER}/${TARGET_REPO_NAME}/forks`, token, {
        method: 'POST',
    });
    const {
        owner: { login: repoOwner },
        name: repoName,
    } = forkData;

    const upstreamBranchRef = await githubApiRequest(
        `/repos/${TARGET_REPO_OWNER}/${TARGET_REPO_NAME}/git/ref/heads/${TARGET_BRANCH}`,
        token
    );
    const startPointSha = upstreamBranchRef.object.sha;

    try {
        await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/refs`, token, {
            method: 'POST',
            body: JSON.stringify({ ref: `refs/heads/${TARGET_BRANCH}`, sha: startPointSha }),
        });
        console.log(`[GitHub Flow] => Branch '${TARGET_BRANCH}' created successfully in the fork.`);
    } catch (error: any) {
        if (error.status === 422 && error.message.includes('Reference already exists')) {
            console.log(`[GitHub Flow] => Branch '${TARGET_BRANCH}' already exists in the fork. Continuing...`);
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
    console.log(`[GitHub Flow] => Calculated next directory name: ${newRaFolderName}`);

    const filesToCommit = generateFileTreeInMemory(rootDocument, newRaFolderName);

    const commitMessage = `feat: Add new RA document - ${rootDocument.metadata.title}`;
    const refData = await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/ref/heads/${TARGET_BRANCH}`, token);
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
    await githubApiRequest(`/repos/${repoOwner}/${repoName}/git/refs/heads/${TARGET_BRANCH}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ sha: newCommitData.sha }),
    });

    return {
        commitUrl: newCommitData.html_url,
        repoFullName: `${repoOwner}/${repoName}`,
    };
}
