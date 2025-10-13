import { Router, Request, Response } from 'express';
import requireAuth from '../middleware/requireAuth';
import { publishToGitHub } from '../services/githubService';
import { generateStandalonePRBody } from '../templates/prTemplate';
import rateLimit from 'express-rate-limit';

// GitHub API helper function
async function githubApiRequest(endpoint: string, token: string, options: RequestInit = {}): Promise<any> {
    const GITHUB_API_URL = 'https://api.github.com';
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
        const error: any = new Error(data.message || `GitHub API error: ${response.status}`);
        error.status = response.status;
        throw error;
    }
    return data;
}

// Rate limiter: limit to 10 publish requests per minute per IP
const publishLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
    message: { error: 'Too many publish requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = Router();

router.post('/publish', publishLimiter, requireAuth, async (req: Request, res: Response) => {
    try {
        const rootDocument = JSON.parse(req.body.document);
        const githubToken = req.user?.githubAccessToken;
        const createPR = true; // Always create PR for publish requests

        if (!rootDocument || !rootDocument.metadata) {
            return res.status(400).json({ error: 'Invalid document data received.' });
        }
        if (!githubToken) {
            return res.status(403).json({ error: 'Forbidden: Valid GitHub token not found in JWT.' });
        }

        const commitResult = await publishToGitHub(rootDocument, githubToken, createPR);

        const response: any = {
            message: `Successfully published to ${commitResult.repoFullName}`,
            commitUrl: commitResult.commitUrl,
            branchName: commitResult.branchName,
        };

        if (commitResult.pullRequestUrl) {
            response.pullRequestUrl = commitResult.pullRequestUrl;
            response.message += ` and created pull request`;
        }

        res.status(200).json(response);
    } catch (error: any) {
        console.error('Error during publish process:', error);
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Endpoint to create a PR from an existing branch
router.post('/create-pr', publishLimiter, requireAuth, async (req: Request, res: Response) => {
    try {
        const { branchName, title, description } = req.body;
        const githubToken = req.user?.githubAccessToken;
        const { TARGET_REPO_OWNER, TARGET_REPO_NAME } = process.env;

        if (!branchName || !title) {
            return res.status(400).json({ error: 'Branch name and title are required.' });
        }
        if (!githubToken) {
            return res.status(403).json({ error: 'Forbidden: Valid GitHub token not found in JWT.' });
        }
        if (!TARGET_REPO_OWNER || !TARGET_REPO_NAME) {
            return res.status(500).json({ error: 'Target repository is not configured on the server.' });
        }

        // Get user info to determine fork owner
        const userInfo = await githubApiRequest('/user', githubToken);
        const forkOwner = userInfo.login;

        const prBody = generateStandalonePRBody(description);

        const prData = await githubApiRequest(`/repos/${TARGET_REPO_OWNER}/${TARGET_REPO_NAME}/pulls`, githubToken, {
            method: 'POST',
            body: JSON.stringify({
                title,
                head: `${forkOwner}:${branchName}`,
                base: 'dev',
                body: prBody,
                maintainer_can_modify: true
            }),
        });

        res.status(200).json({
            message: 'Pull request created successfully',
            pullRequestUrl: prData.html_url,
            prNumber: prData.number,
        });
    } catch (error: any) {
        console.error('Error creating pull request:', error);
        res.status(error.status || 500).json({ error: error.message });
    }
});

export default router;
