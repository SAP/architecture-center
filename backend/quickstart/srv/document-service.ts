import cds from '@sap/cds';

class DocumentService extends cds.ApplicationService {
    async init() {
        this.on("createNewDocument", this.createNewDocument);
        this.on("setDocumentContributors", this.setDocumentContributors);
        this.on("setDocumentTags", this.setDocumentTags);
        return super.init();
    }

    private readDocumentExpanded = async (documentId: string) => {
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
        const { Users } = this.entities;

        const existing: { ID: string } | null = await SELECT.one.from(Users).columns('ID').where({ username });
        if (existing?.ID) return existing.ID;

        const newUserId = (cds.utils as any).uuid();
        await INSERT.into(Users).entries({ ID: newUserId, username });
        return newUserId;
    };

    private assertRequesterIsAuthor = async (req: cds.Request, documentId: string, username: string) => {
        const { Documents, Users } = this.entities;

        const document: { ID: string; author_ID: string } | null = await SELECT.one
            .from(Documents)
            .columns('ID', 'author_ID')
            .where({ ID: documentId });
        if (!document) return req.reject(404, 'Document not found');

        const requester: { ID: string } | null = await SELECT.one
            .from(Users)
            .columns('ID')
            .where({ username });
        if (!requester || requester.ID !== document.author_ID) {
            return req.reject(403, 'Only the document author can modify contributors or tags');
        }
    };

    private replaceDocumentTags = async (req: cds.Request, documentId: string, requestedTags: string[]) => {
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
    ) => {
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
    ) => {
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
            const parentExists = await SELECT.one.from(Documents).columns('ID').where({ ID: normalizedParentId });
            if (!parentExists) {
                return req.reject(400, 'Parent document does not exist');
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

    setDocumentContributors = async (req: cds.Request) => {
        const user = req.user.id;
        const data = req.data as { documentId?: string; contributorsUsernames?: string[] };

        const documentId = data.documentId;
        const requestedContributors = Array.isArray(data.contributorsUsernames) ? data.contributorsUsernames : [];

        if (!documentId) return req.reject(400, 'Missing parameter: documentId');

        await this.assertRequesterIsAuthor(req, documentId, user);

        await this.replaceDocumentContributors(documentId, requestedContributors, user);
        return this.readDocumentExpanded(documentId);
    }

    setDocumentTags = async (req: cds.Request) => {
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