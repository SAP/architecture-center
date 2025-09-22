import express, { Request, Response } from 'express';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { nanoid } from 'nanoid';
import { convertLexicalToMarkdown, findAndSaveDrawioFiles } from './lexicalToMarkdown';

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

const PORT = process.env.PORT || 8080;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const BTP_API_URL = process.env.BTP_API_URL;
const JWT_SECRET = process.env.JWT_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!JWT_SECRET || !FRONTEND_URL) {
    throw new Error('Missing JWT_SECRET or FRONTEND_URL environment variables.');
}

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
            { client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code: code },
            { headers: { Accept: 'application/json' } }
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

const slugify = (text: string) =>
    text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');

async function processDocumentAndChildren(
    doc: any,
    currentPath: string,
    idSegments: string[],
    sidebarPosition: number
) {
    await fs.mkdir(currentPath, { recursive: true });

    const metadata = doc.metadata;
    const raNumber = idSegments[0];
    const id = `id-${idSegments.join('-')}`;
    const slug = `/ref-arch/${nanoid(8)}`;
    const title = `${metadata.title} [${raNumber.toUpperCase()}]`;
    const description = metadata.description || '';
    const sidebarLabel = metadata.title;
    const keywordsAndTags = (metadata.tags || []).map((tag: string) => `  - ${tag}`).join('\n');
    const contributors = Array.from(new Set([...metadata.authors, ...(metadata.contributors || [])]));
    const lastUpdateAuthor = metadata.authors[0] || '';
    const today = new Date().toISOString().split('T')[0];

    const frontMatter = `---
id: ${id}
slug: ${slug}
sidebar_position: ${sidebarPosition}
title: '${title.replace(/'/g, "''")}'
description: '${description.replace(/'/g, "''")}'
keywords:
${keywordsAndTags}
sidebar_label: '${sidebarLabel.replace(/'/g, "''")}'
tags:
${keywordsAndTags}
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
contributors:
${contributors.map((c: string) => `  - ${c}`).join('\n')}
discussion: ''
last_update:
  date: ${today}
  author: ${lastUpdateAuthor}
---
`;

    let markdownContent = '';
    if (doc.editorState) {
        const jsonState = JSON.parse(doc.editorState);
        const drawioPath = path.join(currentPath, 'drawio');
        await fs.mkdir(drawioPath, { recursive: true });
        await findAndSaveDrawioFiles(jsonState.root, drawioPath);
        markdownContent = convertLexicalToMarkdown(JSON.stringify(jsonState));
    }

    const markdownFilePath = path.join(currentPath, 'readme.md');
    await fs.writeFile(markdownFilePath, frontMatter + '\n' + markdownContent);

    await fs.mkdir(path.join(currentPath, 'images'), { recursive: true });

    if (doc.children && doc.children.length > 0) {
        for (const [index, childDoc] of doc.children.entries()) {
            const childPosition = index + 1;
            const childFolderName = `${childPosition}-${slugify(childDoc.metadata.title || 'untitled')}`;
            const childPath = path.join(currentPath, childFolderName);
            const childIdSegments = [...idSegments, childPosition.toString()];

            await processDocumentAndChildren(childDoc, childPath, childIdSegments, childPosition);
        }
    }
}

app.post('/api/publish', async (req: Request, res: Response) => {
    try {
        const rootDocument = req.body;
        if (!rootDocument || !rootDocument.metadata) {
            return res.status(400).send({ message: 'Invalid document data received.' });
        }
        const docsPath = path.resolve(__dirname, '../../../docs/ref-arch');
        const entries = await fs.readdir(docsPath, { withFileTypes: true });
        const raFolders = entries
            .filter((entry) => entry.isDirectory() && entry.name.startsWith('RA'))
            .map((entry) => parseInt(entry.name.substring(2), 10))
            .filter((num) => !isNaN(num));
        const latestRaNumber = raFolders.length > 0 ? Math.max(...raFolders) : 0;
        const newRaNumber = latestRaNumber + 1;
        const newRaFolderName = `RA${newRaNumber.toString().padStart(4, '0')}`;
        const newDocPath = path.join(docsPath, newRaFolderName);
        await processDocumentAndChildren(rootDocument, newDocPath, [newRaFolderName.toLowerCase()], newRaNumber);
        res.status(200).send({ message: `Successfully published to ${newRaFolderName}` });
    } catch (error) {
        console.error('Error during publish process:', error);
        res.status(500).send({ message: 'An error occurred during publishing.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Auth Hub server listening on http://localhost:${PORT}`);
});
