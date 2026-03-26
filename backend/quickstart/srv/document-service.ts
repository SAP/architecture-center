import cds from '@sap/cds';

class DocumentService extends cds.ApplicationService {
    async init() {
        this.on("createNewDocument", this.createNewDocument);
        return super.init();
    }

    createNewDocument = async (
        req: cds.Request
    ) => {
        const { Documents, Users, Tags, DocumentTags, DocumentContributors } = this.entities;
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

        // Users are resolved by natural key (username) and created on demand.
        const resolveOrCreateUserId = async (username: string): Promise<string> => {
            const existing: { ID: string } | null = await SELECT.one.from(Users).columns('ID').where({ username });
            if (existing?.ID) return existing.ID;

            const newUserId = (cds.utils as any).uuid();
            await INSERT.into(Users).entries({ ID: newUserId, username });
            return newUserId;
        };

        const authorId = await resolveOrCreateUserId(user);

        const documentId = cds.utils.uuid();
        await INSERT.into(Documents).entries({
            ID: documentId,
            title: normalizedTitle,
            description: normalizedDescription,
            parent_ID: normalizedParentId,
            author_ID: authorId,
            editorState: normalizedEditorState
        });

        if (tagCodes.length > 0) {
            await INSERT.into(DocumentTags).entries(
                tagCodes.map(tag_code => ({
                    document_ID: documentId,
                    tag_code
                }))
            );
        }

        const contributorUsernames = Array.from(
            new Set(
                requestedContributors
                    .map(username => (typeof username === 'string' ? username.trim() : ''))
                    .filter(username => username.length > 0 && username !== user)
            )
        );

        if (contributorUsernames.length > 0) {
            const contributorRows: Array<{ document_ID: string; user_ID: string; accessLevel: string }> = [];

            for (const contributorUsername of contributorUsernames) {
                const userId = await resolveOrCreateUserId(contributorUsername);
                contributorRows.push({
                    document_ID: documentId,
                    user_ID: userId,
                    accessLevel: 'VIEW'
                });
            }

            await INSERT.into(DocumentContributors).entries(contributorRows);
        }

        const createdDocument = await SELECT.one
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
            ...createdDocument,
            tags: Array.isArray(createdDocument?.tags)
                ? createdDocument.tags.map((entry: any) => entry.tag).filter(Boolean)
                : []
        };
    }
}

export default DocumentService;