import { Router, Request, Response } from 'express';
import requireAuth from '../middleware/requireAuth';
import { publishToGitHub } from '../services/githubService';

const router = Router();

router.post('/publish', requireAuth, async (req: Request, res: Response) => {
    try {
        const rootDocument = JSON.parse(req.body.document);
        const githubToken = req.user?.githubAccessToken;

        if (!rootDocument || !rootDocument.metadata) {
            return res.status(400).json({ error: 'Invalid document data received.' });
        }
        if (!githubToken) {
            return res.status(403).json({ error: 'Forbidden: Valid GitHub token not found in JWT.' });
        }

        const commitResult = await publishToGitHub(rootDocument, githubToken);

        res.status(200).json({
            message: `Successfully published to ${commitResult.repoFullName}`,
            commitUrl: commitResult.commitUrl,
        });
    } catch (error: any) {
        console.error('Error during publish process:', error);
        res.status(error.status || 500).json({ error: error.message });
    }
});

export default router;
