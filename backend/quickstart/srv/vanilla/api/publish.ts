import { Router, Request, Response } from 'express';
import requireAuth from '../middleware/requireAuth';
import { publishToGitHub, syncUserFork } from '../services/githubService';
import { generateStandalonePRBody } from '../templates/prTemplate';
import rateLimit from 'express-rate-limit';
import cds from '@sap/cds';
import { DocumentObject } from '../services/lexicalService';

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

/**
 * Asset data structure for passing to lexicalService
 */
interface AssetData {
    ID: string;
    mediaType: string;
    filename: string;
    content: Buffer | null;
}

/**
 * Fetch a document tree with all assets from the database
 */
async function fetchDocumentTreeWithAssets(
    rootId: string,
    username: string
): Promise<{ document: DocumentObject; assets: Map<string, AssetData> } | null> {
    const db = await cds.connect.to('db');
    const { Documents, DocumentAssets, Users } = db.entities('ac.quickstart');

    // Recursive function to fetch document and its children
    const fetchDocWithChildren = async (docId: string): Promise<DocumentObject | null> => {
        // Fetch the document with relations
        const doc = await SELECT.one
            .from(Documents)
            .columns(
                'ID',
                'title',
                'description',
                'editorState',
                'parent_ID',
                'author_ID'
            )
            .where({ ID: docId });

        if (!doc) return null;

        // Fetch author
        const author = await SELECT.one.from(Users).columns('username').where({ ID: doc.author_ID });

        // Fetch contributors
        const contributors = await SELECT.from('ac.quickstart.DocumentContributors')
            .columns('user_ID')
            .where({ document_ID: docId });

        const contributorUsernames: string[] = [];
        for (const c of contributors) {
            const user = await SELECT.one.from(Users).columns('username').where({ ID: c.user_ID });
            if (user) contributorUsernames.push(user.username);
        }

        // Fetch tags
        const tags = await SELECT.from('ac.quickstart.DocumentTags')
            .columns('tag_code')
            .where({ document_ID: docId });

        // Fetch children
        const childDocs = await SELECT.from(Documents).columns('ID').where({ parent_ID: docId });
        const children: DocumentObject[] = [];
        for (const child of childDocs) {
            const childDoc = await fetchDocWithChildren(child.ID);
            if (childDoc) children.push(childDoc);
        }

        return {
            id: doc.ID,
            editorState: doc.editorState || '',
            parentId: doc.parent_ID || null,
            children,
            metadata: {
                title: doc.title,
                tags: tags.map((t: any) => t.tag_code),
                authors: author ? [author.username] : [],
                contributors: contributorUsernames,
                description: doc.description || '',
            },
        };
    };

    // Fetch root document
    const rootDoc = await SELECT.one
        .from(Documents)
        .columns('ID', 'author_ID')
        .where({ ID: rootId });

    if (!rootDoc) return null;

    // Verify ownership
    const author = await SELECT.one.from(Users).columns('username').where({ ID: rootDoc.author_ID });
    if (!author || author.username !== username) {
        return null; // Not authorized
    }

    // Fetch full document tree
    const document = await fetchDocWithChildren(rootId);
    if (!document) return null;

    // Collect all document IDs in the tree
    const collectDocIds = (doc: DocumentObject): string[] => {
        const ids = [doc.id];
        if (doc.children) {
            for (const child of doc.children) {
                ids.push(...collectDocIds(child));
            }
        }
        return ids;
    };
    const allDocIds = collectDocIds(document);

    // Fetch all assets for all documents in the tree
    const assets = new Map<string, AssetData>();
    for (const docId of allDocIds) {
        const docAssets = await SELECT.from(DocumentAssets)
            .columns('ID', 'mediaType', 'filename', 'content')
            .where({ document_ID: docId });

        for (const asset of docAssets) {
            assets.set(asset.ID, {
                ID: asset.ID,
                mediaType: asset.mediaType,
                filename: asset.filename,
                content: asset.content,
            });
        }
    }

    return { document, assets };
}

router.post('/publish', publishLimiter, requireAuth, async (req: Request, res: Response) => {
    try {
        const githubToken = req.user?.githubAccessToken;
        const username = req.user?.username;

        if (!githubToken) {
            return res.status(403).json({ error: 'Forbidden: Valid GitHub token not found in JWT.' });
        }

        if (!username) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        // Support both old format (document JSON) and new format (rootDocumentId)
        let rootDocument: DocumentObject;
        let assetsMap: Map<string, AssetData> | undefined;

        if (req.body.rootDocumentId) {
            // New format: fetch from database
            const result = await fetchDocumentTreeWithAssets(req.body.rootDocumentId, username);

            if (!result) {
                return res.status(404).json({ error: 'Document not found or you do not have permission to publish it.' });
            }

            rootDocument = result.document;
            assetsMap = result.assets;
        } else if (req.body.document) {
            // Legacy format: document JSON in request body
            rootDocument = JSON.parse(req.body.document);

            if (!rootDocument || !rootDocument.metadata) {
                return res.status(400).json({ error: 'Invalid document data received.' });
            }
        } else {
            return res.status(400).json({ error: 'Missing rootDocumentId or document in request body.' });
        }

        const createPR = true; // Always create PR for publish requests

        const commitResult = await publishToGitHub(rootDocument, githubToken, createPR, assetsMap);

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
        const { TARGET_REPO_OWNER, TARGET_REPO_NAME } = cds.env;

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
                maintainer_can_modify: true,
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

router.post('/api/sync-fork', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const result = await syncUserFork(token);
        res.status(200).json(result);
    } catch (error: any) {
        const status = error.status || 500;
        res.status(status).json({ error: error.message });
    }
});

export default router;
