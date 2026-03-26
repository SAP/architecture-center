import cds from '@sap/cds';

const MAX_ASSET_SIZE_BYTES = 10 * 1024 * 1024; // 10 MiB
const ALLOWED_ASSET_MEDIA_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/vnd.jgraph.mxfile+xml',
    'application/xml',
    'text/xml'
]);
const USERS_ENTITY = 'ac.quickstart.Users';

class DocumentService extends cds.ApplicationService {
    async init(): Promise<void> {
        this.on("createNewDocument", this.createNewDocument);
        this.on("setDocumentContributors", this.setDocumentContributors);
        this.on("setDocumentTags", this.setDocumentTags);
        this.before(["CREATE", "UPDATE", "PATCH"], "DocumentAssets", this.validateDocumentAssetMutation);
        this.before(["CREATE", "UPDATE", "PATCH", "DELETE"], "DocumentTags", this.validateDocumentTagMutation);
        this.before(["CREATE", "UPDATE", "PATCH", "DELETE"], "DocumentContributors", this.validateDocumentContributorMutation);
        return super.init();
    }

    private normalizeMediaType = (mediaType?: string): string => {
        if (typeof mediaType !== 'string') return '';
        return mediaType.split(';')[0].trim().toLowerCase();
    };

    private estimateBinarySize = (content: unknown): number | null => {
        if (!content) return 0;
        if (Buffer.isBuffer(content)) return content.length;
        if (typeof content === 'string') {
            try {
                return Buffer.from(content, 'base64').length;
            } catch {
                return Buffer.byteLength(content);
            }
        }
        if (typeof content === 'object' && content !== null) {
            const maybeArrayBuffer = content as { byteLength?: number };
            if (typeof maybeArrayBuffer.byteLength === 'number') return maybeArrayBuffer.byteLength;
        }
        return null;
    };

    private resolveAssetDocumentId = async (
        req: cds.Request,
        assetId?: string,
        explicitDocumentId?: string
    ): Promise<string> => {
        if (explicitDocumentId) return explicitDocumentId;

        if (!assetId) {
            return req.reject(400, 'Missing asset identifier') as never;
        }

        const { DocumentAssets } = this.entities;
        const existingAsset: { document_ID?: string } | null = await SELECT.one
            .from(DocumentAssets)
            .columns('document_ID')
            .where({ ID: assetId });

        if (!existingAsset?.document_ID) {
            return req.reject(404, 'Document asset not found') as never;
        }

        return existingAsset.document_ID;
    };

    private validateDocumentAssetMutation = async (req: cds.Request): Promise<void> => {
        const data = req.data as {
            ID?: string;
            document_ID?: string;
            mediaType?: string;
            content?: unknown;
        };

        const user = req.user.id;
        const assetId = data?.ID ?? (req.params?.[0] as any)?.ID;
        const documentId = await this.resolveAssetDocumentId(req, assetId, data?.document_ID);

        await this.assertRequesterIsAuthor(req, documentId, user);

        const normalizedMediaType = this.normalizeMediaType(data?.mediaType);
        if (normalizedMediaType && !ALLOWED_ASSET_MEDIA_TYPES.has(normalizedMediaType)) {
            return req.reject(415, `Unsupported media type: ${normalizedMediaType}`);
        }

        const payloadSize = this.estimateBinarySize(data?.content);
        let totalSize = payloadSize;
        if (totalSize === null) {
            const contentLengthHeader = (req as any)?.http?.req?.headers?.['content-length'];
            const parsed = Number(contentLengthHeader);
            if (Number.isFinite(parsed) && parsed >= 0) {
                totalSize = parsed;
            }
        }

        if (typeof totalSize === 'number' && totalSize > MAX_ASSET_SIZE_BYTES) {
            return req.reject(413, `Asset exceeds max size of ${MAX_ASSET_SIZE_BYTES} bytes`);
        }
    };

    private resolveTagDocumentId = async (req: cds.Request): Promise<string> => {
        const data = req.data as {
            document_ID?: string;
        };

        const fromData = data?.document_ID;
        if (fromData) return fromData;

        const fromParams = (req.params?.[0] as any)?.document_ID;
        if (fromParams) return fromParams;

        return req.reject(400, 'Missing DocumentTag document reference') as never;
    };

    private validateDocumentTagMutation = async (req: cds.Request): Promise<void> => {
        const user = req.user.id;
        const documentId = await this.resolveTagDocumentId(req);
        await this.assertRequesterIsAuthor(req, documentId, user);
    };

    private resolveContributorDocumentId = async (req: cds.Request): Promise<string> => {
        const data = req.data as {
            document_ID?: string;
        };

        const fromData = data?.document_ID;
        if (fromData) return fromData;

        const fromParams = (req.params?.[0] as any)?.document_ID;
        if (fromParams) return fromParams;

        return req.reject(400, 'Missing DocumentContributor document reference') as never;
    };

    private validateDocumentContributorMutation = async (req: cds.Request): Promise<void> => {
        const user = req.user.id;
        const documentId = await this.resolveContributorDocumentId(req);
        await this.assertRequesterIsAuthor(req, documentId, user);
    };

    private readDocumentExpanded = async (documentId: string): Promise<any> => {
        const { Documents } = this.entities;

        const document = await SELECT.one
            .from(Documents)
            .columns(d => {
                d.ID;
                d.title;
                d.description;
                d.parent_ID;
                d.editorState;

                d.author((a: any) => {
                    a.username;
                });

                d.contributors((c: any) => {
                    c.accessLevel;
                    c.user((u: any) => {
                        u.username;
                    });
                });

                d.tags((t: any) => {
                    t.tag((tag: any) => {
                        tag.code;
                        tag.label;
                        tag.description;
                    });
                });
            })
            .where({ ID: documentId });

        return {
            ...document,
            tags: Array.isArray(document?.tags)
                ? document.tags.map((entry: any) => entry.tag).filter(Boolean)
                : []
        };
    };

    private resolveOrCreateUser = async (username: string): Promise<string> => {
        const existing: { ID: string } | null = await SELECT.one.from(USERS_ENTITY).columns('ID').where({ username });
        if (existing?.ID) return existing.ID;

        const newUserId = (cds.utils as any).uuid();
        await INSERT.into(USERS_ENTITY).entries({ ID: newUserId, username });
        return newUserId;
    };

    private assertRequesterIsAuthor = async (req: cds.Request, documentId: string, username: string): Promise<void> => {
        const { Documents } = this.entities;

        const document: { ID: string; author_ID: string } | null = await SELECT.one
            .from(Documents)
            .columns('ID', 'author_ID')
            .where({ ID: documentId });
        if (!document) return req.reject(404, 'Document not found');

        const requester: { ID: string } | null = await SELECT.one
            .from(USERS_ENTITY)
            .columns('ID')
            .where({ username });
        if (!requester || requester.ID !== document.author_ID) {
            return req.reject(403, 'Only the document author can modify contributors or tags');
        }
    };

    private replaceDocumentTags = async (req: cds.Request, documentId: string, requestedTags: string[]): Promise<void> => {
        const { Tags, DocumentTags } = this.entities;

        const tagCodes = Array.from(
            new Set(
                requestedTags
                    .map(tag => (typeof tag === 'string' ? tag.trim() : ''))
                    .filter(Boolean)
            )
        );

        if (tagCodes.length > 0) {
            const existingTags: Array<{ code: string }> = await SELECT.from(Tags).columns('code').where({ code: { in: tagCodes } });
            const existingCodes = new Set(existingTags.map(tag => tag.code));
            const missingCodes = tagCodes.filter(code => !existingCodes.has(code));
            if (missingCodes.length > 0) {
                return req.reject(400, `Unknown tags: ${missingCodes.join(', ')}`);
            }
        }

        await DELETE.from(DocumentTags).where({ document_ID: documentId });

        if (tagCodes.length > 0) {
            await INSERT.into(DocumentTags).entries(
                tagCodes.map(tag_code => ({
                    document_ID: documentId,
                    tag_code
                }))
            );
        }
    };

    private replaceDocumentContributors = async (
        documentId: string,
        requestedContributors: string[],
        authorUsername: string
    ): Promise<void> => {
        const { DocumentContributors } = this.entities;

        const contributorUsernames = Array.from(
            new Set(
                requestedContributors
                    .map(username => (typeof username === 'string' ? username.trim() : ''))
                    .filter(username => username.length > 0 && username !== authorUsername)
            )
        );

        await DELETE.from(DocumentContributors).where({ document_ID: documentId });

        if (contributorUsernames.length === 0) return;

        const contributorRows: Array<{ document_ID: string; user_ID: string; accessLevel: string }> = [];
        for (const contributorUsername of contributorUsernames) {
            const userId = await this.resolveOrCreateUser(contributorUsername);
            contributorRows.push({
                document_ID: documentId,
                user_ID: userId,
                accessLevel: 'VIEW'
            });
        }

        await INSERT.into(DocumentContributors).entries(contributorRows);
    };

    createNewDocument = async (
        req: cds.Request
    ): Promise<any> => {
        const { Documents } = this.entities;
        // The authenticated principal is provided by middleware before this handler.
        const user = req.user.id;

        const data = req.data as {
            title?: string;
            description?: string;
            parentId?: string | null;
            tags?: string[];
            contributorsUsernames?: string[];
            editorState?: string;
        };

        const normalizedTitle = typeof data.title === 'string' ? data.title.trim() : '';
        const normalizedDescription = typeof data.description === 'string' ? data.description : null;
        const normalizedParentId = data.parentId ?? null;
        const normalizedEditorState = typeof data.editorState === 'string' ? data.editorState : '';
        const requestedTags = Array.isArray(data.tags) ? data.tags : [];
        const requestedContributors = Array.isArray(data.contributorsUsernames) ? data.contributorsUsernames : [];

        if (!normalizedTitle) return req.reject(400, 'Missing parameter: title');

        if (normalizedParentId) {
            const parent = await SELECT.one.from(Documents).columns('ID', 'author_ID').where({ ID: normalizedParentId });
            if (!parent) {
                return req.reject(400, 'Parent document does not exist');
            }

            const requester: { ID: string } | null = await SELECT.one
                .from(USERS_ENTITY)
                .columns('ID')
                .where({ username: user });
            if (!requester || requester.ID !== parent.author_ID) {
                return req.reject(403, 'Only the parent document author can create child documents');
            }
        }

        const authorId = await this.resolveOrCreateUser(user);

        const documentId = cds.utils.uuid();
        await INSERT.into(Documents).entries({
            ID: documentId,
            title: normalizedTitle,
            description: normalizedDescription,
            parent_ID: normalizedParentId,
            author_ID: authorId,
            editorState: normalizedEditorState
        });

        await this.replaceDocumentTags(req, documentId, requestedTags);
        await this.replaceDocumentContributors(documentId, requestedContributors, user);

        return this.readDocumentExpanded(documentId);
    }

    setDocumentContributors = async (req: cds.Request): Promise<any> => {
        const user = req.user.id;
        const data = req.data as { documentId?: string; contributorsUsernames?: string[] };

        const documentId = data.documentId;
        const requestedContributors = Array.isArray(data.contributorsUsernames) ? data.contributorsUsernames : [];

        if (!documentId) return req.reject(400, 'Missing parameter: documentId');

        await this.assertRequesterIsAuthor(req, documentId, user);

        await this.replaceDocumentContributors(documentId, requestedContributors, user);
        return this.readDocumentExpanded(documentId);
    }

    setDocumentTags = async (req: cds.Request): Promise<any> => {
        const user = req.user.id;
        const data = req.data as { documentId?: string; tags?: string[] };

        const documentId = data.documentId;
        const requestedTags = Array.isArray(data.tags) ? data.tags : [];

        if (!documentId) return req.reject(400, 'Missing parameter: documentId');

        await this.assertRequesterIsAuthor(req, documentId, user);

        await this.replaceDocumentTags(req, documentId, requestedTags);
        return this.readDocumentExpanded(documentId);
    }
}

export default DocumentService;