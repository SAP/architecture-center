import { Router, Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const router = Router();

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, JWT_SECRET, FRONTEND_URL } = process.env;

// Helper to validate that the origin_uri is on the same origin as FRONTEND_URL
// Returns true only if candidate is a relative path, or matches FRONTEND_URL exactly, and resolves to the same origin.
function isTrustedRedirectUrl(candidate: string | undefined): boolean {
    if (!candidate || typeof candidate !== "string" || !FRONTEND_URL) return false;
    try {
        const trustedUrl = new URL(FRONTEND_URL);
        // Accept only exact match or relative path
        if (candidate === FRONTEND_URL) { // exact match
            return true;
        }
        // Accept only relative paths (starting with `/`)
        if (/^\/[^\/\\]/.test(candidate)) {
            // Disallow encoded slashes, protocol-relative URLs, and backslashes
            if (candidate.includes('//') || candidate.includes('\\') || candidate.includes('%2f') || candidate.includes('%2F')) {
                return false;
            }
            // Make sure the resolved URL is same origin
            const candidateUrl = new URL(candidate, FRONTEND_URL);
            return candidateUrl.origin === trustedUrl.origin;
        }
        return false;
    } catch {
        return false;
    }
}
router.get('/login', (req: Request, res: Response) => {
    const { origin_uri } = req.query;
    if (!origin_uri || typeof origin_uri !== 'string') {
        return res.status(400).send('Missing required origin_uri parameter.');
    }
    const callbackUrl = `${req.protocol}://${req.get('host')}/user/github/callback`;

    // THE CHANGE IS HERE: We add "&scope=repo" to the end of the URL.
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&state=${encodeURIComponent(origin_uri)}&scope=repo`;

    res.redirect(githubAuthUrl);
});

// The callback handler does not need to be changed.
// It will now receive a more powerful token from GitHub.
router.get('/github/callback', async (req: Request, res: Response) => {
    const { code, state: origin_uri } = req.query;
    if (!code || typeof code !== 'string') {
        return res.redirect(`${FRONTEND_URL}/login/failure?error=NoCode`);
    }
    try {
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            { client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code },
            { headers: { Accept: 'application/json' } }
        );
        const { access_token: accessToken } = tokenResponse.data;
        if (!accessToken) throw new Error('Failed to retrieve GitHub access token');

        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` },
        });
        const { login, email, avatar_url } = userResponse.data;

        const appToken = jwt.sign(
            {
                username: login,
                email: email,
                avatar: avatar_url,
                provider: 'github',
                githubAccessToken: accessToken,
            },
            JWT_SECRET!,
            { expiresIn: '7d' }
        );

        if (isTrustedRedirectUrl(origin_uri as string)) {
            res.redirect(`${origin_uri}?token=${appToken}`);
        } else {
            res.redirect(`${FRONTEND_URL}/login`);
        }
    } catch (error) {
        console.error('GitHub auth callback error:', error instanceof Error ? error.message : error);
        res.redirect(`${FRONTEND_URL}/login/failure`);
    }
});

export default router;
