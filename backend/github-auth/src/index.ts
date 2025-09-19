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

// ... ALL AUTH ROUTES GO HERE ...

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
