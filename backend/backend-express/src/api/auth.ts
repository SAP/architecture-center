import { Router, Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const router = Router();

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, JWT_SECRET, FRONTEND_URL } = process.env;

router.get('/login', (req: Request, res: Response) => {
    const { origin_uri } = req.query;
    if (!origin_uri || typeof origin_uri !== 'string') {
        return res.status(400).send('Missing required origin_uri parameter.');
    }
    const callbackUrl = `${req.protocol}://${req.get('host')}/user/github/callback`;

    // THE CHANGE IS HERE: We add "&scope=repo" to the end of the URL.
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        callbackUrl
    )}&state=${encodeURIComponent(origin_uri)}&scope=repo`;

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

        res.redirect(`${origin_uri}?token=${appToken}`);
    } catch (error) {
        console.error('GitHub auth callback error:', error instanceof Error ? error.message : error);
        res.redirect(`${FRONTEND_URL}/login/failure`);
    }
});

export default router;
