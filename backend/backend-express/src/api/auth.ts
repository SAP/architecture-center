import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

declare global {
    namespace Express {
        interface Request {
            auth?: {
                username: string;
                githubAccessToken: string;
            };
        }
    }
}

const router = Router();

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, JWT_SECRET, FRONTEND_URL } = process.env;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !JWT_SECRET || !FRONTEND_URL) {
    throw new Error('Missing required environment variables for GitHub OAuth or JWT.');
}

function isTrustedRedirectUrl(candidate: string | undefined): boolean {
    if (!candidate || typeof candidate !== 'string' || !FRONTEND_URL) return false;
    try {
        const trustedUrl = new URL(FRONTEND_URL);
        const candidateUrl = new URL(candidate, FRONTEND_URL);
        if (
            candidateUrl.origin === trustedUrl.origin &&
            candidateUrl.pathname.replace(/\/$/, '') === trustedUrl.pathname.replace(/\/$/, '')
        ) {
            return true;
        }
        if (!candidate.startsWith('http') && !candidate.startsWith('//') && !candidate.startsWith('\\')) {
            if (candidate.includes('//') || candidate.includes('\\') || candidate.toLowerCase().includes('%2f')) {
                return false;
            }
            return candidateUrl.origin === trustedUrl.origin;
        }
        return false;
    } catch {
        return false;
    }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized: Missing or malformed token.');
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET!) as any;
        req.auth = {
            username: decoded.username,
            githubAccessToken: decoded.githubAccessToken,
        };
        next();
    } catch (error) {
        return res.status(401).send('Unauthorized: Invalid token.');
    }
};

const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many search requests from this IP, please try again after 15 minutes.' },
});

router.get('/login', (req: Request, res: Response) => {
    const { origin_uri } = req.query;
    if (!origin_uri || typeof origin_uri !== 'string') {
        return res.status(400).send('Missing required origin_uri parameter.');
    }
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&state=${encodeURIComponent(
        origin_uri
    )}&scope=repo`;
    res.redirect(githubAuthUrl);
});

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
            res.redirect(`${FRONTEND_URL}/quickStart`);
        }
    } catch (error) {
        console.error('GitHub auth callback error:', error instanceof Error ? error.message : error);
        res.redirect(`${FRONTEND_URL}/login/failure`);
    }
});

router.get('/github/search-users', authMiddleware, searchLimiter, async (req: Request, res: Response) => {
    const { q: query } = req.query;
    if (!query || typeof query !== 'string') {
        return res.status(400).send('Missing search query parameter "q".');
    }

    const githubAccessToken = req.auth?.githubAccessToken;
    if (!githubAccessToken) {
        return res.status(401).send('Unauthorized: GitHub token not found in JWT.');
    }

    try {
        const response = await axios.get('https://api.github.com/search/users', {
            params: { q: query, per_page: 10 },
            headers: {
                Authorization: `Bearer ${githubAccessToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.json(response.data);
    } catch (error: any) {
        console.error('Error proxying to GitHub search API:', error.message);
        const status = error.response?.status || 500;
        const data = error.response?.data || { message: 'Internal Server Error' };
        res.status(status).json(data);
    }
});

export default router;
