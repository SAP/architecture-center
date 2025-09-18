import express, { Request, Response } from 'express';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 8080;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const BTP_API_URL = process.env.XSUAA_API_URL;
const JWT_SECRET = process.env.JWT_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL;

console.log('--- SERVER STARTING ---');
console.log('Attempting to load .env from:', envPath);
console.log('BTP_API_URL Loaded:', process.env.BTP_API_URL);
console.log('-----------------------');

if (!JWT_SECRET || !FRONTEND_URL) {
    throw new Error('Missing JWT_SECRET or FRONTEND_URL environment variables.');
}

app.use(cors());

const createAppToken = (payload: { username: string; email?: string; avatar?: string; provider: 'github' | 'btp' }) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

app.get('/api/auth/github', (req: Request, res: Response) => {
    if (!GITHUB_CLIENT_ID) {
        return res.status(500).send('GitHub authentication is not configured on the server.');
    }
    const redirectPath = req.query.redirect || '/';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&state=${encodeURIComponent(
        redirectPath as string
    )}`;
    res.redirect(githubAuthUrl);
});

app.get('/api/auth/github/callback', async (req: Request, res: Response) => {
    const { code, state } = req.query;
    const redirectPath = (state as string) || '/';

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        return res.status(500).send('GitHub authentication is not configured on the server.');
    }

    if (!code || typeof code !== 'string') {
        return res.redirect(`${FRONTEND_URL}/login/failure?error=NoCode`);
    }

    try {
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code,
            },
            {
                headers: { Accept: 'application/json' },
            }
        );

        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) {
            throw new Error('Failed to retrieve GitHub access token');
        }

        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` },
        });
        const userData = userResponse.data;

        const appToken = createAppToken({
            username: userData.login,
            email: userData.email,
            avatar: userData.avatar_url,
            provider: 'github',
        });

        res.redirect(`${FRONTEND_URL}/login/success?token=${appToken}&redirect=${encodeURIComponent(redirectPath)}`);
    } catch (error) {
        console.error('GitHub auth callback error:', error instanceof Error ? error.message : error);
        res.redirect(`${FRONTEND_URL}/login/failure`);
    }
});

app.get('/api/auth/btp', (req: Request, res: Response) => {
    if (!BTP_API_URL) {
        return res.status(500).send('BTP authentication is not configured on the server.');
    }
    const redirectPath = req.query.redirect || '/';
    const callbackUrl = `${req.protocol}://${req.get('host')}/api/auth/btp/callback?redirect=${encodeURIComponent(
        redirectPath as string
    )}`;
    const btpLoginUrl = `${BTP_API_URL}/user/login?origin_uri=${encodeURIComponent(callbackUrl)}`;
    res.redirect(btpLoginUrl);
});

app.get('/api/auth/btp/callback', async (req: Request, res: Response) => {
    const { t: btpToken, redirect: redirectPath } = req.query;

    if (!BTP_API_URL) {
        return res.status(500).send('BTP authentication is not configured on the server.');
    }

    if (!btpToken || typeof btpToken !== 'string') {
        return res.redirect(`${FRONTEND_URL}/login/failure?error=NoBtpToken`);
    }

    try {
        const responseUser = await axios.get(`${BTP_API_URL}/user/getUserInfo`, {
            headers: { Authorization: `Bearer ${btpToken}` },
        });
        const userData = responseUser.data;

        const appToken = createAppToken({
            username: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            provider: 'btp',
        });

        res.redirect(
            `${FRONTEND_URL}/login/success?token=${appToken}&redirect=${encodeURIComponent(
                (redirectPath as string) || '/'
            )}`
        );
    } catch (error) {
        console.error('BTP auth callback error:', error instanceof Error ? error.message : error);
        res.redirect(`${FRONTEND_URL}/login/failure`);
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Auth Hub server listening on http://localhost:${PORT}`);
});
